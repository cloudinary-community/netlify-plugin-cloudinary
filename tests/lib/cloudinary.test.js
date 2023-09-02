import {
  getCloudinary,
  createPublicId,
  getCloudinaryUrl,
  updateHtmlImagesToCloudinary,
} from '../../src/lib/cloudinary'

import mockDemo from '../mocks/demo.json'

const cloudinary = getCloudinary()

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

describe('lib/util', () => {
  const ENV_ORIGINAL = process.env

  beforeEach(() => {
    jest.resetModules()

    process.env = { ...ENV_ORIGINAL }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    })
  })

  afterAll(() => {
    process.env = ENV_ORIGINAL
  })

  describe('createPublicId', () => {
    test('should create a public ID from a remote URL', async () => {
      const mikeId = await createPublicId({
        path: 'https://i.imgur.com/e6XK75j.png',
      })
      expect(mikeId).toEqual('e6XK75j-58e290136642a9c711afa6410b07848d')

      const lucasId = await createPublicId({
        path: 'https://i.imgur.com/vtYmp1x.png',
      })
      expect(lucasId).toEqual('vtYmp1x-ae71a79c9c36b8d5dba872c3b274a444')
    })

    test('should create a public ID from a local image', async () => {
      const dustinId = await createPublicId({
        path: '../images/stranger-things-dustin.jpeg',
      })
      expect(dustinId).toEqual(
        'stranger-things-dustin-9a2a7b1501695c50ad85c329f79fb184',
      )

      const elevenId = await createPublicId({
        path: '../images/stranger-things-eleven.jpeg',
      })
      expect(elevenId).toEqual(
        'stranger-things-eleven-c5486e412115dbeba03315959c3a6d20',
      )
    })
  })

  describe('getCloudinaryUrl', () => {
    test('should create a Cloudinary URL with delivery type of fetch from a local image', async () => {
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: '/tests/images',
        remoteHost: 'https://cloudinary.netlify.app',
      })

      expect(cloudinaryUrl).toEqual(
        `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg`,
      )
    })

    test('should create a Cloudinary URL with delivery type of fetch from a remote image', async () => {
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'fetch',
        path: 'https://i.imgur.com/vtYmp1x.png',
      })

      expect(cloudinaryUrl).toEqual(
        `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png`,
      )
    })

    // TODO: Mock functions to test Cloudinary uploads without actual upload

    test('should create a Cloudinary URL with delivery type of upload from a local image', async () => {
      const { cloudinaryUrl } = await getCloudinaryUrl({
        deliveryType: 'upload',
        path: '/images/stranger-things-dustin.jpeg',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
      })

      expect(cloudinaryUrl).toEqual(
        `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/stranger-things-dustin-fc571e771d5ca7d9223a7eebfd2c505d`,
      )
    })

    // TODO: Mock functions to test Cloudinary uploads without actual upload

    // test('should create a Cloudinary URL with delivery type of upload from a remote image', async () => {
    //   const { cloudinaryUrl }  = await getCloudinaryUrl({
    //     deliveryType: 'upload',
    //     path: 'https://i.imgur.com/vtYmp1x.png'
    //   });

    //   expect(cloudinaryUrl).toEqual(`https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/f_auto,q_auto/vtYmp1x-ae71a79c9c36b8d5dba872c3b274a444`);
    // });
  })

  describe('updateHtmlImagesToCloudinary', () => {
    it('should replace a local image with a Cloudinary URL', async () => {
      const sourceHtml =
        '<html><head></head><body><p><img src="/images/stranger-things-dustin.jpeg"></p></body></html>'

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
      })

      expect(html).toEqual(
        `<html><head></head><body><p><img src=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg\" loading=\"lazy"\></p></body></html>`,
      )
    })

    it('should replace a remote image with a Cloudinary URL', async () => {
      const sourceHtml =
        '<html><head></head><body><p><img src="https://i.imgur.com/vtYmp1x.png"></p></body></html>'

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
      })

      expect(html).toEqual(
        `<html><head></head><body><p><img src=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png\" loading=\"lazy"\></p></body></html>`,
      )
    })

    it('should replace a local image with a Cloudinary URL in a srcset', async () => {
      const sourceHtml =
        '<html><head></head><body><p><img src="/images/stranger-things-dustin.jpeg" srcset="/images/stranger-things-dustin.jpeg 1x, /images/stranger-things-dustin.jpeg 2x"></p></body></html>'

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
      })

      expect(html).toEqual(
        `<html><head></head><body><p><img src=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg\" srcset=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg 1x, https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://cloudinary.netlify.app/images/stranger-things-dustin.jpeg 2x\" loading=\"lazy"\></p></body></html>`,
      )
    })

    it('should add lazy loading to image when no option is provided', async () => {
      const sourceHtml =
        '<html><head></head><body><p><img src="https://i.imgur.com/vtYmp1x.png"></p></body></html>'

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
      })

      expect(html).toEqual(
        `<html><head></head><body><p><img src=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png\" loading=\"lazy"\></p></body></html>`,
      )
    })

    it('should add eager loading to image when eager option is provided for loadingStrategy', async () => {
      const sourceHtml =
        '<html><head></head><body><p><img src="https://i.imgur.com/vtYmp1x.png"></p></body></html>'

      const { html } = await updateHtmlImagesToCloudinary(sourceHtml, {
        deliveryType: 'fetch',
        localDir: 'tests',
        remoteHost: 'https://cloudinary.netlify.app',
        loadingStrategy: 'eager',
      })

      expect(html).toEqual(
        `<html><head></head><body><p><img src=\"https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/f_auto,q_auto/https://i.imgur.com/vtYmp1x.png\" loading=\"eager"\></p></body></html>`,
      )
    })

    it('should test uploading multiple assets', async () => {
      // This is meant to replicate the current demo

      const { html } = await updateHtmlImagesToCloudinary(mockDemo.htmlBefore, {
        deliveryType: 'upload',
        localDir: 'demo/.next',
        remoteHost: 'https://main--netlify-plugin-cloudinary.netlify.app',
        folder: 'netlify-plugin-cloudinary',
        assets: mockDemo.assets,
      })

      expect(html).toEqual(mockDemo.htmlAfter)
    })
  })
})
