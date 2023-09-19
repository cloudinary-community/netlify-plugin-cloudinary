const fs = require('fs').promises;
const { onBuild } = require('../src/');
const { ERROR_API_CREDENTIALS_REQUIRED } = require('../src/data/errors');

describe('onBuild', () => {
  const ENV_ORIGINAL = process.env;
  const readdir = fs.readdir;

  beforeEach(() => {
    fs.readdir = jest.fn();
    jest.resetModules();

    process.env = { ...ENV_ORIGINAL };

    process.env.SITE_NAME = 'cool-site';
    process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';
    process.env.CLOUDINARY_API_KEY = '123456789012345';
    process.env.CLOUDINARY_API_SECRET = 'abcd1234';
  });

  afterAll(() => {
    fs.readdir = readdir;
    process.env = ENV_ORIGINAL;
  });

  describe('Config', () => {

    test('should error when using delivery type of upload without API Key and Secret', async () => {
      // Test that verifies that delivery of type of fetch works without API Key and Secret can be found
      // below under test: should create redirects with defaut fetch-based configuration in production context
      // We don't need a "special" test for this as it's default functionality that should work with
      // any valid test, so we can isntead ensure the keys don't exist and delete them

      jest.spyOn(global.console, 'error').mockImplementation();

      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      process.env.DEPLOY_PRIME_URL = 'https://deploy-preview-1234--netlify-plugin-cloudinary.netlify.app';

      const deliveryType = 'upload';
      const imagesPath = '/images';

      await onBuild({
        constants: {
          PUBLISH_DIR: `.next/out${imagesPath}`
        },
        inputs: {
          deliveryType
        },
        utils: {
          build: {
            failBuild: () => {}
          }
        }
      });

      expect(console.error).toBeCalledWith(`[Cloudinary] ${ERROR_API_CREDENTIALS_REQUIRED}`);
    });

  });

  describe('Redirects', () => {

    test('should create redirects with defaut fetch-based configuration in production context', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);

      process.env.CONTEXT = 'production';
      process.env.NETLIFY_HOST = 'https://netlify-plugin-cloudinary.netlify.app';

      // Tests to ensure that delivery type of fetch works without API Key and Secret as it should

      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

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
          PUBLISH_DIR: `.next/out${imagesPath}`
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

    test('should create redirects with defaut fetch-based configuration in deploy preview context', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);

      process.env.CONTEXT = 'deploy-preview';
      process.env.DEPLOY_PRIME_URL = 'https://deploy-preview-1234--netlify-plugin-cloudinary.netlify.app';

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
          PUBLISH_DIR: `.next/out${imagesPath}`
        },
        inputs: {
          deliveryType
        }
      });

      expect(redirects[0]).toEqual({
        from: `${imagesPath}/*`,
        to: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/${deliveryType}/f_auto,q_auto/${process.env.DEPLOY_PRIME_URL}/cld-assets${imagesPath}/:splat`,
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

    test('should create redirects with multiple image paths', async () => {
      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);

      process.env.CONTEXT = 'deploy-preview';
      process.env.DEPLOY_PRIME_URL = 'https://deploy-preview-1234--netlify-plugin-cloudinary.netlify.app';

      const deliveryType = 'fetch';
      const imagesPath = [ '/images', '/assets' ];

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
          PUBLISH_DIR: __dirname
        },
        inputs: {
          deliveryType,
          imagesPath
        }
      });

      expect(redirects[0]).toEqual({
        from: `${imagesPath[1]}/*`,
        to: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/${deliveryType}/f_auto,q_auto/${process.env.DEPLOY_PRIME_URL}/cld-assets${imagesPath[1]}/:splat`,
        status: 302,
        force: true
      });

      expect(redirects[1]).toEqual({
        from: `/cld-assets${imagesPath[1]}/*`,
        to: `${imagesPath[1]}/:splat`,
        status: 200,
        force: true
      });
      expect(redirects[2]).toEqual({
        from: `${imagesPath[0]}/*`,
        to: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/${deliveryType}/f_auto,q_auto/${process.env.DEPLOY_PRIME_URL}/cld-assets${imagesPath[0]}/:splat`,
        status: 302,
        force: true
      });

      expect(redirects[3]).toEqual({
        from: `/cld-assets${imagesPath[0]}/*`,
        to: `${imagesPath[0]}/:splat`,
        status: 200,
        force: true
      });

      expect(redirects[4]).toEqual(defaultRedirect);
    });

  });

});
