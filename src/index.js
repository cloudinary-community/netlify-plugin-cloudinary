const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const glob = require('glob');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const cloudinary = require('cloudinary').v2;

/**
 * TODO
 * - Handle srcset
 * - Delivery type for redirect via Netlify redirects
 */

module.exports = {

  async onPostBuild({ constants, inputs }) {
    const { PUBLISH_DIR } = constants;
    const { deliveryType, uploadPreset } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || inputs.cloudName;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if ( !cloudName ) {
      throw new Error('Cloudinary Cloud Name required. Please use environment variable CLOUDINARY_CLOUD_NAME');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret
    });

    // Find all HTML source files in the publish directory

    const pages = glob.sync(`${PUBLISH_DIR}/**/*.html`);
    const errors = [];

    for ( const page of pages ) {
      const html = await fs.readFile(page, 'utf-8');
      const dom = new JSDOM(html);

      // Loop through all images found in the DOM and swap the source with
      // a Cloudinary URL

      const images = Array.from(dom.window.document.querySelectorAll('img'));

      for ( const $img of images ) {
        let imgSrc = $img.getAttribute('src');
        let cloudinarySrc;

        if ( deliveryType === 'fetch' ) {
          // fetch allows us to pass in a remote URL to the Cloudinary API
          // which it will cache and serve from the CDN, but not store

          imgSrc = determineRemoteUrl(imgSrc);

          cloudinarySrc = cloudinary.url(imgSrc, {
            type: deliveryType,
            secure: true,
            transformation: [
              {
                fetch_format: 'auto',
                quality: 'auto'
              }
            ]
          });
        } else if ( deliveryType === 'upload' ) {
          // upload will actually store the image in the Cloudinary account
          // and subsequently serve that stored image

          // If our image is locally sourced, we need to obtain the full
          // local relative path so that we can tell Cloudinary where
          // to upload from

          const { name: imgName } = path.parse(imgSrc);
          let hash = crypto.createHash('md5');

          if ( !isRemoteUrl(imgSrc) ) {
            imgSrc = path.join(PUBLISH_DIR, imgSrc);
            hash.update(imgSrc);
          } else {
            const response = await fetch(imgSrc);
            const buffer = await response.buffer();
            hash.update(buffer);
          }

          hash = hash.digest('hex');

          const id = `${imgName}-${hash}`;

          let results;
          
          if ( apiKey && apiSecret ) {
            // We need an API Key and Secret to use signed uploading

            try {
              results = await cloudinary.uploader.upload(imgSrc, {
                public_id: id,
                overwrite: false
              });
            } catch(e) {
              const { error } = e;
              errors.push({
                imgSrc,
                message: e.message || error.message
              });
              continue;
            }
          } else if ( uploadPreset ) {
            // If we want to avoid signing our uploads, we don't need our API Key and Secret,
            // however, we need to provide an uploadPreset

            try {
              results = await cloudinary.uploader.unsigned_upload(imgSrc, uploadPreset, {
                public_id: id,
                // Unsigned uploads default to overwrite: false
              });
            } catch(e) {
              const { error } = e;
              errors.push({
                imgSrc,
                message: e.message || error.message
              });
              continue;
            }
          } else {
            throw new Error(`To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`);
          }

          // Finally use the stored public ID to grab the image URL

          const { public_id } = results;

          cloudinarySrc = cloudinary.url(public_id, {
            secure: true,
            transformation: [
              {
                fetch_format: 'auto',
                quality: 'auto'
              }
            ]
          });

        }

        $img.setAttribute('src', cloudinarySrc)

        await fs.writeFile(page, dom.serialize());
      }
    }

    if ( errors.length > 0) {
      console.log(`Done with ${errors.length} errors...`);
      console.log(JSON.stringify(errors, null, 2));
    } else {
      console.log('Done.');
    }
  }

}

/**
 * isRemoteUrl
 */

function isRemoteUrl(path) {
  return path.startsWith('http');
}

/** 
 * determineRemoteUrl
 */

function determineRemoteUrl(path) {
  if ( isRemoteUrl(path) ) return path;

  let url = path;

  if ( !path.startsWith('/') ) {
    url = `/${url}`;
  }
  
  url = `${process.env.DEPLOY_PRIME_URL}${url}`;

  return url;
}