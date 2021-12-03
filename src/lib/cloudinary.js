const crypto = require('crypto');
const path = require('path');
const fetch = require('node-fetch');
const cloudinary = require('cloudinary').v2;

const { isRemoteUrl, determineRemoteUrl } = require('./util');

/**
 * getCloudinary
 */

function getCloudinary() {
  return cloudinary;
}

module.exports.getCloudinary = getCloudinary;

/**
 * getCloudinaryUrl
 */

async function getCloudinaryUrl(options = {}) {
  const {
    apiKey,
    apiSecret,
    deliveryType,
    folder,
    path: filePath,
    publishDir,
    uploadPreset,
  } = options;

  let fileLocation;

  if ( deliveryType === 'fetch' ) {
    // fetch allows us to pass in a remote URL to the Cloudinary API
    // which it will cache and serve from the CDN, but not store

    fileLocation = determineRemoteUrl(filePath);
  } else if ( deliveryType === 'upload' ) {
    // upload will actually store the image in the Cloudinary account
    // and subsequently serve that stored image

    // If our image is locally sourced, we need to obtain the full
    // local relative path so that we can tell Cloudinary where
    // to upload from

    let fullPath = filePath;

    if ( !isRemoteUrl(fullPath) ) {
      fullPath = path.join(publishDir, fullPath);
    }

    const id = await createPublicId({
      path: fullPath
    });

    const uploadOptions = {
      folder,
      public_id: id
    }

    let results;

    if ( apiKey && apiSecret ) {
      // We need an API Key and Secret to use signed uploading

      results = await cloudinary.uploader.upload(fullPath, {
        ...uploadOptions,
        overwrite: false
      });
    } else if ( uploadPreset ) {
      // If we want to avoid signing our uploads, we don't need our API Key and Secret,
      // however, we need to provide an uploadPreset

      results = await cloudinary.uploader.unsigned_upload(fullPath, uploadPreset, {
        ...uploadOptions
        // Unsigned uploads default to overwrite: false
      });
    } else {
      throw new Error(`To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`);
    }

    // Finally use the stored public ID to grab the image URL

    const { public_id } = results;
    fileLocation = public_id;
  }

  const cloudinaryUrl = cloudinary.url(fileLocation, {
    type: deliveryType,
    secure: true,
    transformation: [
      {
        fetch_format: 'auto',
        quality: 'auto'
      }
    ]
  });

  return cloudinaryUrl;
}

module.exports.getCloudinaryUrl = getCloudinaryUrl;

/**
 * createPublicId
 */

async function createPublicId({ path: filePath } = {}) {
  let hash = crypto.createHash('md5');

  const { name: imgName } = path.parse(filePath);

  if ( !isRemoteUrl(filePath) ) {
    hash.update(filePath);
  } else {
    const response = await fetch(filePath);
    const buffer = await response.buffer();
    hash.update(buffer);
  }

  hash = hash.digest('hex');

  return `${imgName}-${hash}`
}

module.exports.createPublicId = createPublicId;