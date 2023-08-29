const fs = require('fs').promises
const path = require('path');
const glob = require('glob');

const { configureCloudinary, updateHtmlImagesToCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');
const { PUBLIC_ASSET_PATH } = require('./data/cloudinary');
const { ERROR_CLOUD_NAME_REQUIRED, ERROR_NETLIFY_HOST_UNKNOWN, EEROR_NETLIFY_HOST_CLI_SUPPORT } = require('./data/errors');

const CLOUDINARY_ASSET_DIRECTORIES = [
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

const _cloudinaryAssets = {};

module.exports = {
  async onBuild({ netlifyConfig, constants, inputs, utils }) {
    console.log('Creating redirects...');

    const { PUBLISH_DIR } = constants;

    const host = process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_HOST;

    const {
      deliveryType,
      uploadPreset,
      folder = process.env.SITE_NAME,
      imagesPath = CLOUDINARY_ASSET_DIRECTORIES.find(({ inputKey }) => inputKey === 'imagesPath').path
    } = inputs;

    if ( !host && deliveryType === 'fetch' ) {
      console.warn(ERROR_NETLIFY_HOST_UNKNOWN);
      console.log(EEROR_NETLIFY_HOST_CLI_SUPPORT);
      return;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      utils.build.failBuild(ERROR_CLOUD_NAME_REQUIRED);
      return;
    }

    configureCloudinary({
      cloudName,
      apiKey,
      apiSecret
    });

    // Look for any available images in the provided imagesPath to collect
    // asset details and to grab a Cloudinary URL to use later

    const imagesDirectory = glob.sync(`${PUBLISH_DIR}/${imagesPath}/**/*`);
    const imagesFiles = imagesDirectory.filter(file => !!path.extname(file));

    if ( imagesFiles.length === 0 ) {
      console.warn(`No image files found in ${imagesPath}`);
      console.log(`Did you update your images path? You can set the imagesPath input in your Netlify config.`);
    }

    try {
      _cloudinaryAssets.images = await Promise.all(imagesFiles.map(async image => {
        const publishPath = image.replace(PUBLISH_DIR, '');

        const cloudinary = await getCloudinaryUrl({
          deliveryType,
          folder,
          path: publishPath,
          localDir: PUBLISH_DIR,
          uploadPreset,
          remoteHost: host
        });

        return {
          publishPath,
          ...cloudinary
        }
      }));
    } catch(e) {
      utils.build.failBuild(e.message);
      return;
    }

    // If the delivery type is set to upload, we need to be able to map individual assets based on their public ID,
    // which would require a dynamic middle solution, but that adds more hops than we want, so add a new redirect
    // for each asset uploaded

    if ( deliveryType === 'upload' ) {
      await Promise.all(Object.keys(_cloudinaryAssets).flatMap(mediaType => {
        return _cloudinaryAssets[mediaType].map(async asset => {
          const { publishPath, cloudinaryUrl } = asset;

          netlifyConfig.redirects.unshift({
            from: `${publishPath}*`,
            to: cloudinaryUrl,
            status: 302,
            force: true
          });
        })
      }));
    }

    // If the delivery type is fetch, we're able to use the public URL and pass it right along "as is", so
    // we can create generic redirects. The tricky thing is to avoid a redirect loop, we modify the
    // path, so that we can safely allow Cloudinary to fetch the media remotely

    if ( deliveryType === 'fetch' ) {
      await Promise.all(CLOUDINARY_ASSET_DIRECTORIES.map(async ({ inputKey, path: defaultPath }) => {
        const mediaPath = inputs[inputKey] || defaultPath;
        const cldAssetPath = `/${path.join(PUBLIC_ASSET_PATH, mediaPath)}`;
        const cldAssetUrl = `${host}/${cldAssetPath}`;

        const { cloudinaryUrl: assetRedirectUrl } = await getCloudinaryUrl({
          deliveryType: 'fetch',
          folder,
          path: `${cldAssetUrl}/:splat`,
          uploadPreset
        });

        netlifyConfig.redirects.unshift({
          from: `${cldAssetPath}/*`,
          to: `${mediaPath}/:splat`,
          status: 200,
          force: true
        });

        netlifyConfig.redirects.unshift({
          from: `${mediaPath}/*`,
          to: assetRedirectUrl,
          status: 302,
          force: true
        });
      }));
    }

    console.log('Done.');
  },

  // Post build looks through all of the output HTML and rewrites any src attributes to use a cloudinary URL
  // This only solves on-page references until any JS refreshes the DOM

  async onPostBuild({ constants, inputs, utils }) {
    console.log('Replacing on-page images with Cloudinary URLs...');

    const host = process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_HOST;

    if ( !host ) {
      console.warn(ERROR_NETLIFY_HOST_UNKNOWN);
      console.log(EEROR_NETLIFY_HOST_CLI_SUPPORT);
      return;
    }

    const { PUBLISH_DIR } = constants;
    const {
      deliveryType,
      loadingStrategy,
      uploadPreset,
      folder = process.env.SITE_NAME
    } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      utils.build.failBuild(ERROR_CLOUD_NAME_REQUIRED);
      return;
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
        assets: _cloudinaryAssets,
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