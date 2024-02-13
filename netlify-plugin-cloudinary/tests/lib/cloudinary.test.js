import { vi, expect, describe, test, beforeEach, afterAll, it } from 'vitest';

import { ERROR_ASSET_UPLOAD } from '../../src/data/errors';
import { getCloudinary, createPublicId, configureCloudinary, getCloudinaryUrl, updateHtmlImagesToCloudinary } from '../../src/lib/cloudinary';
import { ANALYTICS_SDK_CODE, ANALYTICS_PRODUCT } from '../../src/data/analytics';

const mockDemo = require('../mocks/demo.json');

const cloudinary = getCloudinary();

const TEST_ANALYTICS_CONFIG = {
  sdkCode: ANALYTICS_SDK_CODE,
  sdkSemver: '1.1.1',
  techVersion: '1.1.1',
  product: ANALYTICS_PRODUCT,
}

const TEST_ANALYTICS_STRING = 'BBFCd1Bl0';

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
    })
  });

  afterAll(() => {
    process.env = ENV_ORIGINAL;
  });

  describe('createPublicId', () => {

    test('should create a public ID from a remote URL', async () => {
      const mikeId = await createPublicId({ path: 'https://i.imgur.com/e6XK75j.png' });
      expect(mikeId).toEqual('e6XK75j-58e290136642a9c711afa6410b07848d');

      const lucasId = await createPublicId({ path: 'https://i.imgur.com/vtYmp1x.png' });
      expect(lucasId).toEqual('vtYmp1x-ae71a79c9c36b8d5dba872c3b274a444');
    });

    test('should create a public ID from a local image', async () => {
      const dustinId = await createPublicId({ path: '../images/stranger-things-dustin.jpeg' });
      expect(dustinId).toEqual('stranger-things-dustin-9a2a7b1501695c50ad85c329f79fb184');

      const elevenId = await createPublicId({ path: '../images/stranger-things-eleven.jpeg' });
      expect(elevenId).toEqual('stranger-things-eleven-c5486e412115dbeba03315959c3a6d20');
    });

  });

  describe('getCloudinaryUrl', () => {

    test('should create a Cloudinary URL with delivery type of fetch from a local image', async () => {
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: '/tests/images',
        remoteHost: 'https://cloudinary.netlify.app'
      });

      expect(cloudinaryUrl).toMatch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg`);
    });

    test('should create a Cloudinary URL with delivery type of fetch from a remote image', async () => {

      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: 'https://i.imgur.com/vtYmp1x.png'
      });

      expect(cloudinaryUrl).toMatch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png`);
    });


    test('should create a Cloudinary URL with delivery type of upload from a local image', async () => {
      // mock cloudinary.uploader.upload call
      cloudinary.uploader.upload = vi.fn().mockResolvedValue({
        public_id: 'stranger-things-dustin-fc571e771d5ca7d9223a7eebfd2c505d',
        secure_url: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1613009008/stranger-things-dustin-fc571e771d5ca7d9223a7eebfd2c505d.jpg`,
        original_filename: 'stranger-things-dustin',
        version: 1613009008,
        width: 1280,
        height: 720,
        format: 'jpg',
        resource_type: 'image',
        created_at: '2021-02-11T16:43:28Z',
      })

      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'upload',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app'
      });

      expect(cloudinaryUrl).toMatch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/stranger-things-dustin-fc571e771d5ca7d9223a7eebfd2c505d`);
    });

    test('should fail to create a Cloudinary URL with delivery type of upload', async () => {
      // mock cloudinary.uploader.upload call
      cloudinary.uploader.upload = vi.fn().mockImplementation(() => Promise.reject('error'))


      await expect(getCloudinaryUrl({
        deliveryType: 'upload',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app'
      })).rejects.toThrow(ERROR_ASSET_UPLOAD);
    });




    // TODO: Mock functions to test Cloudinary uploads without actual upload

    // test('should create a Cloudinary URL with delivery type of upload from a remote image', async () => {
    //   const { cloudinaryUrl }  = await getCloudinaryUrl({
    //     deliveryType: 'upload',
    //     path: 'https://i.imgur.com/vtYmp1x.png'
    //   });

    //   expect(cloudinaryUrl).toMatch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/vtYmp1x-ae71a79c9c36b8d5dba872c3b274a444`);
    // });

    test('should apply transformations', async () => {
      const maxSize = {
        width: 800,
        height: 600,
        dpr: '3.0',
        crop: 'limit'
      }
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: '/tests/images',
        remoteHost: 'https://cloudinary.netlify.app',
        transformations: [maxSize]
      });

      expect(cloudinaryUrl).toMatch(`https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/c_${maxSize.crop},dpr_${maxSize.dpr},h_${maxSize.height},w_${maxSize.width}/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg`);
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

      expect(html).toEqual(`<html><head></head><body><p><img src=\"https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg?_a=${TEST_ANALYTICS_STRING}\" loading=\"lazy"\></p></body></html>`);
    });

    it('should replace a remote image with a Cloudinary URL', async () => {
      const sourceHtml = '<html><head></head><body><p><img src="https://i.imgur.com/vtYmp1x.png"></p></body></html>';

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        loadingStrategy: 'lazy'
      }, TEST_ANALYTICS_CONFIG);

      expect(html).toEqual(`<html><head></head><body><p><img src=\"https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png?_a=${TEST_ANALYTICS_STRING}\" loading=\"lazy"\></p></body></html>`);
    });


    it('should replace a local image with a Cloudinary URL in a srcset', async () => {
      const sourceHtml = '<html><head></head><body><p><img src="/images/stranger-things-dustin.jpeg" srcset="/images/stranger-things-dustin.jpeg 1x, /images/stranger-things-dustin.jpeg 2x"></p></body></html>';

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
        loadingStrategy: 'lazy'
      }, TEST_ANALYTICS_CONFIG);

      expect(html).toEqual(`<html><head></head><body><p><img src=\"https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg?_a=${TEST_ANALYTICS_STRING}\" srcset=\"https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg?_a=${TEST_ANALYTICS_STRING} 1x, https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg?_a=${TEST_ANALYTICS_STRING} 2x\" loading=\"lazy"\></p></body></html>`);
    });

    it('should add eager loading to image when eager option is provided for loadingStrategy', async () => {
      const sourceHtml = '<html><head></head><body><p><img src="https://i.imgur.com/vtYmp1x.png"></p></body></html>';

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
        loadingStrategy: 'eager'
      }, TEST_ANALYTICS_CONFIG);

      expect(html).toEqual(`<html><head></head><body><p><img src=\"https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png?_a=${TEST_ANALYTICS_STRING}\" loading=\"eager"\></p></body></html>`);
    });

    it('should test uploading multiple assets', async () => {
      // This is meant to replicate the current demo

      const { html } = await updateHtmlImagesToCloudinary(mockDemo.htmlBefore, {
        deliveryType: 'upload',
        localDir: 'demo/.next',
        remoteHost: 'https://main--netlify-plugin-cloudinary.netlify.app',
        loadingStrategy: 'lazy',
        folder: 'netlify-plugin-cloudinary',
        assets: mockDemo.assets
      }, TEST_ANALYTICS_CONFIG);

      expect(html).toEqual(mockDemo.htmlAfter);
    });

  });

});
