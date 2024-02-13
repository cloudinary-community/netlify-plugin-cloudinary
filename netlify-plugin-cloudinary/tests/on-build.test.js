import { promises as fs } from 'fs';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { onBuild } from '../src/';
import { ERROR_API_CREDENTIALS_REQUIRED } from '../src/data/errors';

const contexts = [
  {
    name: 'production',
    url: 'https://netlify-plugin-cloudinary.netlify.app'
  },
  {
    name: 'deploy-preview',
    url: 'https://deploy-preview-1234--netlify-plugin-cloudinary.netlify.app'
  }
]

describe('onBuild', () => {
  const ENV_ORIGINAL = process.env;
  const readdir = fs.readdir;

  beforeEach(() => {
    fs.readdir = vi.fn();
    vi.resetModules();

    process.env = { ...ENV_ORIGINAL };

    process.env.SITE_NAME = 'cool-site';
    process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';
    process.env.CLOUDINARY_API_KEY = '123456789012345';
    process.env.CLOUDINARY_API_SECRET = 'abcd1234';
  });

  afterEach(() => {
    fs.readdir = readdir;
    process.env = ENV_ORIGINAL;
  });

  describe('Config', () => {

    test('should error when using delivery type of upload without API Key and Secret', async () => {
      // Test that verifies that delivery of type of fetch works without API Key and Secret can be found
      // below under test: should create redirects with defaut fetch-based configuration in production context
      // We don't need a "special" test for this as it's default functionality that should work with
      // any valid test, so we can isntead ensure the keys don't exist and delete them

      vi.spyOn(global.console, 'error').mockImplementation();

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
            failBuild: () => { }
          }
        }
      });

      expect(console.error).toBeCalledWith(`[Cloudinary] ${ERROR_API_CREDENTIALS_REQUIRED}`);
    });

  });

  describe('Redirects', () => {

    let deliveryType = 'fetch';
    let netlifyConfig;
    let redirects;

    const defaultRedirect = {
      from: '/path',
      to: '/other-path',
      status: 200
    }

    beforeEach(async () => {
      // Tests to ensure that delivery type of fetch works without API Key and Secret as it should

      delete process.env.CLOUDINARY_API_KEY;
      delete process.env.CLOUDINARY_API_SECRET;

      // resets vars for each tests
      redirects = [defaultRedirect];

      netlifyConfig = {
        redirects
      };

      const imagesFunctionName = 'cld_images';

      fs.readdir.mockResolvedValue([imagesFunctionName]);
    });

    function validate(imagesPath, redirects, url) {
      if (typeof (imagesPath) === 'string') {
        imagesPath = [imagesPath]
      };

      let count = 0
      imagesPath?.reverse().forEach(element => {
        let i = element.split(path.win32.sep).join(path.posix.sep).replace('/', '');

        // The analytics string that's added to the URLs is dynamic based on package version.
        // The resulting value is also not static, so we can't simply add it to the end of the
        // URL, so strip the analytics from the URLs as it's not important for this particular
        // test, being covered elsewhere.

        redirects.forEach(redirect => {
          if ( redirect.to.includes('https://res.cloudinary.com') ) {
            redirect.to = redirect.to.split('?')[0];
          }
        })

        expect(redirects[count]).toEqual({
          from: `/${i}/*`,
          to: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/${deliveryType}/f_auto,q_auto/${process.env.URL}/cld-assets/${i}/:splat`,
          status: 302,
          force: true
        });

        expect(redirects[count + 1]).toEqual({
          from: `/cld-assets/${i}/*`,
          to: `/${i}/:splat`,
          status: 200,
          force: true
        });
        count += 2;
      });
      expect(redirects[redirects.length - 1]).toEqual(defaultRedirect);
    }

    describe.each(['posix', 'win32'])('Operating system: %o', (os) => {
      let separator = path[os].sep;
      let imagesPathStrings = [
        '/images',
        '/nest',
        '/images/nesttest'
      ];
      imagesPathStrings = imagesPathStrings.map(i => i.replace(/\//g, separator));

      let imagesPathLists = [
        [['/images', '/assets']],
        [['/images/nest1', '/assets/nest2']],
        [['/example/hey', '/mixed', '/test']]
      ];
      imagesPathLists = imagesPathLists.map(collection =>
        collection.map(imagesPath =>
          imagesPath.map(i => i.replace(/\//g, separator))
        )
      );

      describe.each(contexts)(`should create redirects with default ${deliveryType}-based configuration in $name context`, async (context) => {
        process.env.URL = context.url;

        test.each(imagesPathLists)('%o', async (imagesPath) => {

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
          validate(imagesPath, redirects);
        });

        test.each(imagesPathStrings)('%o', async (imagesPath) => {

          await onBuild({
            netlifyConfig,
            constants: {
              PUBLISH_DIR: `.next/out${imagesPath}`
            },
            inputs: {
              deliveryType,
              imagesPath
            }
          });
          validate(imagesPath, redirects);
        });

        test('imagesPath undefined', async () => {

          await onBuild({
            netlifyConfig,
            constants: {
              PUBLISH_DIR: '.next/out/'
            },
            inputs: {
              deliveryType
            }
          });
          let imagesPath = '/images';
          validate(imagesPath, redirects);
        });
      });
    })
  });
});
