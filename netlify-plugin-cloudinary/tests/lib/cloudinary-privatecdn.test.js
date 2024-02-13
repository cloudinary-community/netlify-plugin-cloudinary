import { vi, expect, describe, test, beforeEach, afterAll, it } from 'vitest';

import { configureCloudinary, getCloudinaryUrl, updateHtmlImagesToCloudinary } from '../../src/lib/cloudinary';
import { ANALYTICS_SDK_CODE, ANALYTICS_PRODUCT } from '../../src/data/analytics';

const TEST_ANALYTICS_CONFIG = {
  sdkCode: ANALYTICS_SDK_CODE,
  sdkSemver: '1.1.1',
  techVersion: '1.1.1',
  product: ANALYTICS_PRODUCT,
}

const TEST_ANALYTICS_STRING = 'AFCd1Bl0';

describe('lib/util', () => {
  const ENV_ORIGINAL = process.env;

  beforeEach(() => {
    vi.resetModules();

    process.env = { ...ENV_ORIGINAL };
    process.env.CLOUDINARY_CLOUD_NAME = 'testcloud';
    process.env.CLOUDINARY_API_KEY = '123456789012345';
    process.env.CLOUDINARY_API_SECRET = 'abcd1234';

    configureCloudinary({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      privateCdn: true,
    });
  });

  afterAll(() => {
    process.env = ENV_ORIGINAL;
  });

  describe('getCloudinaryUrl', () => {

    test('should create a Cloudinary URL with delivery type of fetch from a local image', async () => {
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: '/tests/images',
        remoteHost: 'https://cloudinary.netlify.app'
      });

      expect(cloudinaryUrl).toMatch(`https://${process.env.CLOUDINARY_CLOUD_NAME}-res.cloudinary.com/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg`);
    });

  });

  describe('updateHtmlImagesToCloudinary', () => {

    it('should replace a local image with a Cloudinary URL', async () => {
      const sourceHtml = '<html><head></head><body><p><img src="/images/stranger-things-dustin.jpeg"></p></body></html>';

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
        loadingStrategy: 'lazy'
      }, TEST_ANALYTICS_CONFIG);

      expect(html).toEqual(`<html><head></head><body><p><img src=\"https://${process.env.CLOUDINARY_CLOUD_NAME}-res.cloudinary.com/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg?_a=${TEST_ANALYTICS_STRING}\" loading=\"lazy"\></p></body></html>`);
    });

  });

});
