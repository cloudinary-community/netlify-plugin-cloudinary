const fs = require('fs-extra');
const ncc = require('@vercel/ncc');
const { onBuild } = require('../src/');

jest.mock('fs-extra', () => ({
  readdir: jest.fn(),
  ensureDir: jest.fn(),
  writeFile: jest.fn(),
}));

jest.mock('@vercel/ncc', () => jest.fn());

describe('onBuild', () => {

  describe('Redirects', () => {

    test('should create redirects with defaut fetch-based configuration', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);
      ncc.mockResolvedValue('exports.handler = async function (event, context) {}');

      process.env.SITE_NAME = 'cool-site';
      process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';

      const deliveryType = 'fetch';

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
          INTERNAL_FUNCTIONS_SRC: '.netlify/functions-internal'
        },
        inputs: {
          deliveryType
        }
      });

      expect(redirects[0]).toEqual({
        from: '/images/*',
        to: `/.netlify/functions/${imagesFunctionName}?path=/images/:splat&deliveryType=${deliveryType}&cloudName=${process.env.CLOUDINARY_CLOUD_NAME}&folder=${process.env.SITE_NAME}`,
        status: 302,
        force: true
      });

      expect(redirects[1]).toEqual({
        from: 'cld-assets/images/*',
        to: '/images/:splat',
        status: 200,
        force: true
      });

      expect(redirects[2]).toEqual(defaultRedirect);
    });


    test('should create redirects with upload delivery type and custom inputs', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);
      ncc.mockResolvedValue('exports.handler = async function (event, context) {}');

      process.env.SITE_NAME = 'cool-site';

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
        redirects
      };

      await onBuild({
        netlifyConfig,
        constants: {
          INTERNAL_FUNCTIONS_SRC: '.netlify/functions-internal'
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
        from: `${imagesPath}/*`,
        to: `/.netlify/functions/${imagesFunctionName}?path=${imagesPath}/:splat&uploadPreset=${uploadPreset}&deliveryType=${deliveryType}&cloudName=${process.env.CLOUDINARY_CLOUD_NAME}&folder=${folder}`,
        status: 302,
        force: true
      });

      expect(redirects[1]).toEqual({
        from: `cld-assets${imagesPath}/*`,
        to: `${imagesPath}/:splat`,
        status: 200,
        force: true
      });

      expect(redirects[2]).toEqual(defaultRedirect);
    });

  });

});