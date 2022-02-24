const fs = require('fs-extra')
const path = require('path');
const glob = require('glob');

const { configureCloudinary, updateHtmlImagesToCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');
const { PUBLIC_ASSET_PATH } = require('./data/cloudinary');

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

module.exports = {
  async onPreBuild({ netlifyConfig, constants, inputs }) {
    const host = process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_HOST;

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

    // If we're using the fetch API, we don't need to worry about uploading any
    // of the media as it will all be publicly accessible, so we can skip this step

    if ( deliveryType === 'fetch' ) {
      console.log('Skipping: Delivery type set to fetch.')
      return;
    }

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

    const images = await Promise.all(imagesFiles.map(async image => {
      const publishPath = image.replace(PUBLISH_DIR, '');
      const publishUrl = `${host}${publishPath}`;
      const cldAssetPath = `/${path.join(PUBLIC_ASSET_PATH, publishPath)}`;
      const cldAssetUrl = `${host}${cldAssetPath}`;

      const cloudinary = await getCloudinaryUrl({
        deliveryType,
        folder,
        path: publishPath,
        localDir: PUBLISH_DIR,
        uploadPreset,
        remoteHost: host,
      });

      return {
        publishPath,
        publishUrl,
        ...cloudinary
      }
    }));

    netlifyConfig.build.environment.CLOUDINARY_ASSETS = {
      images
    }
  },

  async onBuild({ netlifyConfig, constants, inputs }) {
    const host = process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_HOST;

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

    // If the delivery type is set to upload, we need to be able to map individual assets based on their public ID,
    // which would require a dynamic middle solution, but that adds more hops than we want, so add a new redirect
    // for each asset uploaded

    if ( deliveryType === 'upload' ) {
      await Promise.all(Object.keys(netlifyConfig.build.environment.CLOUDINARY_ASSETS).flatMap(mediaType => {
        return netlifyConfig.build.environment.CLOUDINARY_ASSETS[mediaType].map(async asset => {
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
      await Promise.all(CLOUDINARY_ASSET_DIRECTORIES.map(async ({ name: mediaName, inputKey, path: defaultPath }) => {
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

  },

  // Post build looks through all of the output HTML and rewrites any src attributes to use a cloudinary URL
  // This only solves on-page references until any JS refreshes the DOM

  async onPostBuild({ netlifyConfig, constants, inputs }) {
    const host = process.env.DEPLOY_PRIME_URL || process.env.NETLIFY_HOST;

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
        assets: netlifyConfig.build.environment.CLOUDINARY_ASSETS,
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