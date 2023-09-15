import crypto from 'crypto'
import path from 'path'
import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import { v2 as cloudinary, ConfigOptions } from 'cloudinary'

import { isRemoteUrl, determineRemoteUrl } from './util'
import { ERROR_CLOUD_NAME_REQUIRED } from '../data/errors'

type CloudinaryConfig = {
  apiKey?: string;
  apiSecret?: string;
  cloudName: string;
  cname?: string;
  privateCdn?: boolean;
}
type DeliveryType =
  string
  | "upload"
  | "private"
  | "authenticated"
  | "fetch"
  | "multi"
  | "text"
  | "asset"
  | "list"
  | "facebook"
  | "twitter"
  | "twitter_name"
  | "instagram"
  | "gravatar"
  | "youtube"
  | "hulu"
  | "vimeo"
  | "animoto"
  | "worldstarhiphop"
  | "dailymotion";

type UploadOptions = {
  folder: string;
  public_id: string;
  overwrite: boolean
  upload_preset?: string
}

type FetchDelivery = {
  deliveryType: 'fetch';
  remoteHost: string;
}

type OtherDelivery = {
  deliveryType: Omit<DeliveryType, 'fetch'>;
  remoteHost?: string
}
type CloudinaryOptions = {
  folder: string,
  path: string;
  localDir?: string;
  uploadPreset: string;
} & (FetchDelivery | OtherDelivery)

export type Assets = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: Array<any>
}

type UpdateCloudinaryOptions = Omit<CloudinaryOptions, 'path'> & {
  assets: Assets;
  loadingStrategy?: "lazy"
}

/**
 * getCloudinary
 */

export function getCloudinary(config: CloudinaryOptions & CloudinaryConfig) {
  if (!config) return cloudinary
  return configureCloudinary(config)
}


/**
 * configureCloudinary
 */
export function configureCloudinary(config: CloudinaryConfig) {
  const cloudinaryConfig: ConfigOptions = {
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    private_cdn: config.privateCdn,
    secure: true
  }

  if ( config.cname ) {
    cloudinaryConfig.secure_distribution = config.cname;
    // When configuring a cname, we need to additionally set private CDN
    // to be true in order to work properly, which may not be obvious
    // to those setting it up
    cloudinaryConfig.private_cdn = true;
  }

  cloudinary.config(cloudinaryConfig);

  return cloudinary
}


/**
 * createPublicId
 */

export async function createPublicId({ path: filePath }: { path: string }) {
  const hash = crypto.createHash('md5')

  const { name: imgName } = path.parse(filePath)

  if (!isRemoteUrl(filePath)) {
    hash.update(filePath)
  } else {
    const response = await fetch(filePath)
    const buffer = await response.buffer()
    hash.update(buffer)
  }

  const digest = hash.digest('hex')

  return `${imgName}-${digest}`
}


/**
 * getCloudinaryUrl
 */

export async function getCloudinaryUrl(options: CloudinaryOptions) {
  const {
    deliveryType,
    folder,
    path: filePath,
    localDir,
    remoteHost,
    uploadPreset,
  } = options

  const {
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  } = cloudinary.config()
  const canSignUpload = apiKey && apiSecret

  if (!cloudName) {
    throw new Error(ERROR_CLOUD_NAME_REQUIRED)
  }

  if (deliveryType === 'upload' && !canSignUpload && !uploadPreset) {
    throw new Error(
      `To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`,
    )
  }

  let fileLocation
  let publicId

  if (deliveryType === 'fetch') {
    // fetch allows us to pass in a remote URL to the Cloudinary API
    // which it will cache and serve from the CDN, but not store

    fileLocation = determineRemoteUrl(filePath, remoteHost as string)
    publicId = fileLocation
  } else if (deliveryType === 'upload') {
    // upload will actually store the image in the Cloudinary account
    // and subsequently serve that stored image

    // If our image is locally sourced, we need to obtain the full
    // local relative path so that we can tell Cloudinary where
    // to upload from

    let fullPath = filePath

    if (!isRemoteUrl(fullPath)) {
      fullPath = path.join(localDir ?? '', fullPath)
    }

    const id = await createPublicId({
      path: fullPath,
    })

    const uploadOptions: UploadOptions = {
      folder,
      public_id: id,
      overwrite: false,
    }

    if (uploadPreset) {
      uploadOptions.upload_preset = uploadPreset
    }

    let results

    if (canSignUpload) {
      // We need an API Key and Secret to use signed uploading

      results = await cloudinary.uploader.upload(fullPath, {
        ...uploadOptions,
      })
    } else {
      // If we want to avoid signing our uploads, we don't need our API Key and Secret,
      // however, we need to provide an uploadPreset

      results = await cloudinary.uploader.unsigned_upload(
        fullPath,
        uploadPreset,
        {
          ...uploadOptions,
        },
      )
    }

    // Finally use the stored public ID to grab the image URL

    const { public_id } = results
    publicId = public_id
    fileLocation = fullPath
  }

  const cloudinaryUrl = cloudinary.url(publicId, {
    type: deliveryType,
    secure: true,
    transformation: [
      {
        fetch_format: 'auto',
        quality: 'auto',
      },
    ],
  })

  return {
    sourceUrl: fileLocation,
    cloudinaryUrl,
    publicId,
  }
}

/**
 * updateHtmlImagesToCloudinary
 */

// function to check for assets previously build by Cloudinary
function getAsset(imgUrl: string, assets: Assets) {
  const cloudinaryAsset =
    assets &&
    Array.isArray(assets.images) &&
    assets.images.find(({ publishPath, publishUrl } = {}) => {
      return [publishPath, publishUrl].includes(imgUrl)
    })

  return cloudinaryAsset
}

export async function updateHtmlImagesToCloudinary(html: string, options: UpdateCloudinaryOptions) {
  const {
    assets,
    deliveryType,
    uploadPreset,
    folder,
    localDir,
    remoteHost,
    loadingStrategy = 'lazy',
  } = options

  const errors = []
  const dom = new JSDOM(html)

  // Loop through all images found in the DOM and swap the source with
  // a Cloudinary URL

  const images = Array.from(dom.window.document.querySelectorAll('img'))

  for (const $img of images) {
    const imgSrc = $img.getAttribute('src') as string // @TODO can this be really be null at this point?
    let cloudinaryUrl

    // Check to see if we have an existing asset already to pick from
    // Look at both the path and full URL

    const asset = getAsset(imgSrc, assets)

    if (asset && deliveryType === 'upload') {
      cloudinaryUrl = asset.cloudinaryUrl
    }

    // If we don't have an asset and thus don't have a Cloudinary URL, create
    // one for our asset

    if (!cloudinaryUrl) {
      try {
        const { cloudinaryUrl: url } = await getCloudinaryUrl({
          deliveryType,
          folder,
          path: imgSrc,
          localDir,
          uploadPreset,
          remoteHost,
        })
        cloudinaryUrl = url
      } catch (e) {
        if (e instanceof Error) {
          errors.push({
            imgSrc,
            message: e.message
          })
        }

        continue
      }
    }

    $img.setAttribute('src', cloudinaryUrl)
    $img.setAttribute('loading', loadingStrategy)

    // convert srcset images to cloudinary

    const srcset = $img.getAttribute('srcset')

    if (srcset) {
      // convert all srcset urls to cloudinary urls using getCloudinaryUrl function in a Promise.all

      const srcsetUrls = srcset.split(',').map(url => url.trim().split(' '))

      const srcsetUrlsPromises = srcsetUrls.map(url => {
        const exists = getAsset(url[0], assets)
        if (exists && deliveryType === 'upload') {
          return exists.cloudinaryUrl
        }
        return getCloudinaryUrl({
          deliveryType,
          folder,
          path: url[0],
          localDir,
          uploadPreset,
          remoteHost,
        })
      })

      const srcsetUrlsCloudinary = await Promise.all(srcsetUrlsPromises)
      const srcsetUrlsCloudinaryString = srcsetUrlsCloudinary
        .map(
          (urlCloudinary, index) =>
            `${urlCloudinary.cloudinaryUrl} ${srcsetUrls[index][1]}`,
        )
        .join(', ')

      $img.setAttribute('srcset', srcsetUrlsCloudinaryString)
    }

    // Look for any preload tags that reference the image URLs. A specific use case here
    // is Next.js App Router hen using the Image component.

    const $preload = dom.window.document.querySelector(
      `link[rel="preload"][as="image"][href="${imgSrc}"]`,
    )

    if ($preload) {
      $preload.setAttribute('href', cloudinaryUrl)
    }
  }

  return {
    html: dom.serialize(),
    errors,
  }
}

