const fs = require('fs').promises;
const glob = require('glob');
const { JSDOM } = require('jsdom');

const { getCloudinary, getCloudinaryUrl } = require('./lib/cloudinary');

/**
 * TODO
 * - Handle srcset
 * - Delivery type for redirect via Netlify redirects
 */

module.exports = {

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

    const cloudinary = getCloudinary();

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

        try {
          const cloudinarySrc = await getCloudinaryUrl({
            apiKey,
            apiSecret,
            deliveryType,
            folder,
            path: imgSrc,
            publishDir: PUBLISH_DIR,
            uploadPreset,
          });
  
          $img.setAttribute('src', cloudinarySrc)
        } catch(e) {
          const { error } = e;
          errors.push({
            imgSrc,
            message: e.message || error.message
          });
          continue;
        }
        
      }

      await fs.writeFile(page, dom.serialize());
    }

    if ( errors.length > 0) {
      console.log(`Done with ${errors.length} errors...`);
      console.log(JSON.stringify(errors, null, 2));
    } else {
      console.log('Done.');
    }
  }

}