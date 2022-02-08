
const fs = require('fs-extra')
const path = require('path');
const glob = require('glob');
const ncc = require('@vercel/ncc');

const { getCloudinary, updateHtmlImagesToCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');

const CLOUDINARY_ASSET_PATH = "/cloudinary-assets";
const CLOUDINARY_IMAGES_PATH = `${CLOUDINARY_ASSET_PATH}/images`;

const CLOUDINARY_MEDIA_FUNCTIONS = ['images'];

/**
 * TODO
 * - Handle srcset
 */

module.exports = {

  async onBuild({ netlifyConfig, constants, inputs }) {
    const { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC } = constants;
    const { uploadPreset, deliveryType, folder = process.env.SITE_NAME } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please set cloudName input or use environment variable CLOUDINARY_CLOUD_NAME');
    }

    const functionsPath = INTERNAL_FUNCTIONS_SRC || FUNCTIONS_SRC;

    // Copy all of the templates over including the functions to deploy

    const functionTemplatesPath = path.join(__dirname, 'templates/functions');
    const functionTemplates = await fs.readdir(functionTemplatesPath);

    try {
      await Promise.all(functionTemplates.map(async templateFileName => {
        const bundle = await ncc(path.join(functionTemplatesPath, templateFileName));
        const { name, base } = path.parse(templateFileName);
        const templateDirectory = path.join(functionsPath, name);
        await fs.mkdir(templateDirectory);
        await fs.writeFile(path.join(templateDirectory, base), bundle.code, 'utf8');
      }));
    } catch(e) {
      console.log('Failed to generate templates:', e);
      throw e;
    }

    // Configure reference parameters for Cloudinary delivery to attach to redirect

    const params = {
      uploadPreset,
      deliveryType,
      cloudName,
      folder
    }

    const paramsString = Object.keys(params)
      .filter(key => typeof params[key] !== 'undefined')
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    // Redirect any requests that hits /[media type]/* to a serverless function

    CLOUDINARY_MEDIA_FUNCTIONS.forEach(mediaName => {
      const functionName = `cld_${mediaName}`;

      netlifyConfig.redirects.push({
        from: `/${mediaName}/*`,
        to: `${process.env.DEPLOY_PRIME_URL}/.netlify/functions/${functionName}/:splat?${paramsString}`,
        status: 302,
        force: true,
      });

      netlifyConfig.redirects.push({
        from: `/cld-assets/${mediaName}/*`,
        to: `/${mediaName}/:splat`,
        status: 200,
        force: true
      });
    });

  },

  // Post build looks through all of the output HTML and rewrites any src attributes to use a cloudinary URL
  // This only solves on-page references until any JS refreshes the DOM

  async onPostBuild({ constants, inputs }) {
    const { PUBLISH_DIR } = constants;
    const {
      deliveryType,
      uploadPreset,
      folder = process.env.SITE_NAME
    } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please use environment variable CLOUDINARY_CLOUD_NAME');
    }

    const cloudinary = getCloudinary({
      cloudName,
      apiKey,
      apiSecret
    });

    // Find all HTML source files in the publish directory

    const pages = glob.sync(`${PUBLISH_DIR}/**/*.html`);

    const results = await Promise.all(pages.map(async page => {
      const sourceHtml = await fs.readFile(page, 'utf-8');

      const { html, errors } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType,
        uploadPreset,
        folder,
        localDir: PUBLISH_DIR,
        remoteHost: process.env.DEPLOY_PRIME_URL
      });

      await fs.writeFile(page, html);

      return {
        page,
        errors
      }
    }));

    const errors = results.filter(({ errors }) => errors.length > 0);

    if ( errors.length > 0) {
      console.log(`Done with ${errors.length} errors...`);
      console.log(JSON.stringify(errors, null, 2));
    } else {
      console.log('Done.');
    }
  }

}