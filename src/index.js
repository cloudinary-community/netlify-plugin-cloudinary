const glob = require('glob');
const fs = require('fs').promises;
const { JSDOM } = require('jsdom');

const CLOUD_NAME = 'colbycloud';

module.exports = {

  async onPostBuild({ constants }) {
    const { PUBLISH_DIR } = constants;

    const pages = glob.sync(`${PUBLISH_DIR}/**/*.html`);


    for ( const page of pages ) {
      const html = await fs.readFile(page, 'utf-8');
      const dom = new JSDOM(html);
      const images = Array.from(dom.window.document.querySelectorAll('img'));

      for ( const $img of images ) {
        const imgSrc = $img.getAttribute('src');
        let cloudinarySrc = imgSrc

        if ( !imgSrc.startsWith('http') ) {
          if ( !imgSrc.startsWith('/') ) {
            cloudinarySrc = `/${cloudinarySrc}`;
          }
          cloudinarySrc = `${process.env.DEPLOY_URL}${cloudinarySrc}`;
        }

        cloudinarySrc = `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/${cloudinarySrc}`;

        $img.setAttribute('src', cloudinarySrc)

        await fs.writeFile(page, dom.serialize());
      }
    }
  }

}