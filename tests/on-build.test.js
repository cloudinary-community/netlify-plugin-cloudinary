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


    test('should create redirects with upload delivery type and custom inputs', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);

      process.env.SITE_NAME = 'cool-site';
      process.env.NETLIFY_HOST = 'https://test-netlify-site.netlify.app';

      const cloudName = 'othercloud';
      const deliveryType = 'upload';
      const imagesPath = '/awesome';
      const folder = 'test-folder';
      const uploadPreset = 'my-upload-preset';

      const defaultRedirect = {
        from: '/path',
        to: '/other-path',
        status: 200
      }

      const redirects = [defaultRedirect];

      const netlifyConfig = {
        redirects,
        build: {
          environment: {
            CLOUDINARY_ASSETS: {
              images: [
                {
                  publishPath: `${imagesPath}/publicid.jpeg`,
                  cloudinaryUrl: `https://res.cloudinary.com/colbycloud/image/upload/f_auto,q_auto/v1/netlify-plugin-cloudinary/publicid-1234`
                }
              ]
            }
          }
        }
      };

      await onBuild({
        netlifyConfig,
        constants: {
        },
        inputs: {
          cloudName,
          deliveryType,
          imagesPath,
          folder,
          uploadPreset
        }
      });

      expect(redirects[0]).toEqual({
        from: `${netlifyConfig.build.environment.CLOUDINARY_ASSETS.images[0].publishPath}*`,
        to: netlifyConfig.build.environment.CLOUDINARY_ASSETS.images[0].cloudinaryUrl,
        status: 302,
        force: true
      });

      expect(redirects[1]).toEqual(defaultRedirect);
    });

  });

});