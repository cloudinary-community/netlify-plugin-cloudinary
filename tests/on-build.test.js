const fs = require('fs-extra');
const { onBuild } = require('../src/');

jest.mock('fs-extra', () => ({
  readdir: jest.fn(),
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
}));


describe('onBuild', () => {

  describe('Redirects', () => {

    test('should create redirects with defaut fetch-based configuration', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);

      process.env.SITE_NAME = 'cool-site';
      process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';

      const deliveryType = 'fetch';
      const imagesPath = '/images';

      const defaultRedirect = {
        from: '/path',
        to: '/other-path',
        status: 200
      }

      const redirects = [defaultRedirect];

      const netlifyConfig = {
        redirects
      };

      await onBuild({
        netlifyConfig,
        constants: {
          PUBLISH_DIR: '.next/out/images'
        },
        inputs: {
          deliveryType
        }
      });

      expect(redirects[0]).toEqual({
        from: `${imagesPath}/*`,
        to: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/${deliveryType}/f_auto,q_auto/${process.env.NETLIFY_HOST}/cld-assets${imagesPath}/:splat`,
        status: 302,
        force: true
      });

      expect(redirects[1]).toEqual({
        from: `/cld-assets${imagesPath}/*`,
        to: `${imagesPath}/:splat`,
        status: 200,
        force: true
      });

      expect(redirects[2]).toEqual(defaultRedirect);
    });

  });

});