const fs = require('fs-extra')
const path = require('path');
const glob = require('glob');
const ncc = require('@vercel/ncc');

const { configureCloudinary, updateHtmlImagesToCloudinary } = require('./lib/cloudinary');
const { PREFIX, PUBLIC_ASSET_PATH } = require('./data/cloudinary');

const CLOUDINARY_MEDIA_FUNCTIONS = [
  {
    name: 'images',
    inputKey: 'imagesPath',
    path: '/images'
  }
];

/**
 * TODO
 * - Handle srcset
 */

module.exports = {

  async onBuild({ netlifyConfig, constants, inputs }) {
    const { FUNCTIONS_SRC, INTERNAL_FUNCTIONS_SRC } = constants;
    const {
      deliveryType,
      folder = process.env.SITE_NAME,
      uploadPreset,
    } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;

    if ( !cloudName ) {
      throw new Error('A Cloudinary Cloud Name is required. Please set cloudName input or use the environment variable CLOUDINARY_CLOUD_NAME');
    }

    const functionsPath = INTERNAL_FUNCTIONS_SRC || FUNCTIONS_SRC;

    // Copy all of the templates over including the functions to deploy

    const functionTemplatesPath = path.join(__dirname, 'templates/functions');
    const functionTemplates = await fs.readdir(functionTemplatesPath);

    if ( !Array.isArray(functionTemplates) || functionTemplates.length == 0 ) {
      throw new Error(`Failed to generate templates: can not find function templates in ${functionTemplatesPath}`);
    }

    try {
      await Promise.all(functionTemplates.map(async templateFileName => {
        const bundle = await ncc(path.join(functionTemplatesPath, templateFileName));
        const { name, base } = path.parse(templateFileName);
        const templateDirectory = path.join(functionsPath, name);
        const filePath = path.join(templateDirectory, base);

        await fs.ensureDir(templateDirectory);
        await fs.writeFile(filePath, bundle.code, 'utf8');
      }));
    } catch(e) {
      throw new Error(`Failed to generate templates: ${e}`);
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

    CLOUDINARY_MEDIA_FUNCTIONS.forEach(({ name: mediaName, inputKey, path: defaultPath }) => {
      const mediaPath = inputs[inputKey] || defaultPath;
      const mediaPathSplat = path.join(mediaPath, ':splat');
      const functionName = `${PREFIX}_${mediaName}`;

      netlifyConfig.redirects.unshift({
        from: path.join(PUBLIC_ASSET_PATH, mediaPath, '*'),
        to: mediaPathSplat,
        status: 200,
        force: true
      });

      netlifyConfig.redirects.unshift({
        from: path.join(mediaPath, '*'),
        to: `/.netlify/functions/${functionName}?path=${mediaPathSplat}&${paramsString}`,
        status: 302,
        force: true,
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

    const host = process.env.DEPLOY_PRIME_URL;

    if ( !host ) {
      console.warn('Cannot determine Netlify host, not proceeding with on-page image replacement.');
      console.log('Note: The Netlify CLI does not currently support the ability to determine the host locally, try deploying on Netlify.');
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please use an environment variable CLOUDINARY_CLOUD_NAME');
    }

    configureCloudinary({
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
        remoteHost: host
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