const glob = require('glob');
const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');
const cloudinary = require('cloudinary').v2;

/**
 * TODO
 * - Track uploads to avoid uploading same image multiple times
 */

module.exports = {

  async onPostBuild({ constants, inputs }) {
    const { PUBLISH_DIR } = constants;
    const { deliveryType, uploadPreset } = inputs;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
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

    const pages = glob.sync(`${PUBLISH_DIR}/**/*.html`);

    for ( const page of pages ) {
      const html = await fs.readFile(page, 'utf-8');
      const dom = new JSDOM(html);
      const images = Array.from(dom.window.document.querySelectorAll('img'));

      for ( const $img of images ) {
        let imgSrc = $img.getAttribute('src');
        let cloudinarySrc;

        if ( deliveryType === 'fetch' ) {
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

          if ( !isRemoteUrl(imgSrc) ) {
            imgSrc = path.join(PUBLISH_DIR, imgSrc);
          }

          let results;
          
          if ( apiKey && apiSecret ) {
            try {
              results = await cloudinary.uploader.upload(imgSrc);
            } catch(e) {
              console.log('e', e)
            }
          } else if ( uploadPreset ) {
            try {
              results = await cloudinary.uploader.unsigned_upload(imgSrc, uploadPreset);
            } catch(e) {
              console.log('e', e)
            }
          } else {
            throw new Error(`To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`);
          }

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