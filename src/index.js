const fs = require('fs-extra')
const path = require('path');
const glob = require('glob');

const { configureCloudinary, updateHtmlImagesToCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');
const { PUBLIC_ASSET_PATH } = require('./data/cloudinary');

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
    const host = process.env.DEPLOY_PRIME_URL;

    if ( !host ) {
      console.warn('Cannot determine Netlify host, not proceeding with on-page image replacement.');
      console.log('Note: The Netlify CLI does not currently support the ability to determine the host locally, try deploying on Netlify.');
      return;
    }

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
      throw new Error('A Cloudinary Cloud Name is required. Please set cloudName input or use the environment variable CLOUDINARY_CLOUD_NAME');
    }

    configureCloudinary({
      cloudName,
      apiKey,
      apiSecret
    });

    const imagesDirectory = glob.sync(`${PUBLISH_DIR}/images/**/*`);
    const imagesFiles = imagesDirectory.filter(file => !!path.extname(file));

    await Promise.all(imagesFiles.map(async file => {
      const filePath = file.replace(PUBLISH_DIR, '');

      const cldAssetPath = `/${path.join(PUBLIC_ASSET_PATH, filePath)}`;
      const cldAssetUrl = `${host}/${cldAssetPath}`;

      const assetRedirectUrl = await getCloudinaryUrl({
        deliveryType: 'fetch',
        folder,
        path: `${cldAssetUrl}:splat`,
        uploadPreset
      });

      netlifyConfig.redirects.unshift({
        from: `${cldAssetPath}*`,
        to: `${filePath}:splat`,
        status: 200,
        force: true
      });

      netlifyConfig.redirects.unshift({
        from: `${filePath}*`,
        to: assetRedirectUrl,
        status: 302,
        force: true
      });
    }));
  },

  // Post build looks through all of the output HTML and rewrites any src attributes to use a cloudinary URL
  // This only solves on-page references until any JS refreshes the DOM

  async onPostBuild({ constants, inputs }) {

    const host = process.env.DEPLOY_PRIME_URL;

    if ( !host ) {
      console.warn('Cannot determine Netlify host, not proceeding with on-page image replacement.');
      console.log('Note: The Netlify CLI does not currently support the ability to determine the host locally, try deploying on Netlify.');
      return;
    }

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
      throw new Error('A Cloudinary Cloud Name is required. Please set cloudName input or use the environment variable CLOUDINARY_CLOUD_NAME');
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