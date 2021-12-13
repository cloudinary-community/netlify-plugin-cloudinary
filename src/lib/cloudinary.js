const crypto = require('crypto');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
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
 * createPublicId
 */

async function createPublicId({ path: filePath } = {}) {
  let hash = crypto.createHash('md5');

  const { name: imgName } = path.parse(filePath);
  const name = imgName.split('?')[0];

  if ( !isRemoteUrl(filePath) ) {
    hash.update(filePath);
  } else {
    const response = await fetch(filePath);
    const buffer = await response.buffer();
    hash.update(buffer);
  }

  hash = hash.digest('hex');

  return `${name}-${hash}`
}

module.exports.createPublicId = createPublicId;

/**
 * getCloudinaryUrl
 */

async function getCloudinaryUrl(options = {}) {
  const {
    deliveryType,
    folder,
    path: filePath,
    localDir,
    remoteHost,
    uploadPreset,
  } = options;

  const { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret } = cloudinary.config();
  const canSignUpload = apiKey && apiSecret;

  if ( !cloudName ) {
    throw new Error('Cloudinary Cloud Name required.');
  }

  if ( deliveryType === 'upload' && !canSignUpload && !uploadPreset ) {
    throw new Error(`To use deliveryType ${deliveryType}, please use an uploadPreset for unsigned requests or an API Key and Secret for signed requests.`);
  }

  let fileLocation;

  if ( deliveryType === 'fetch' ) {
    // fetch allows us to pass in a remote URL to the Cloudinary API
    // which it will cache and serve from the CDN, but not store

    fileLocation = determineRemoteUrl(filePath, remoteHost);
  } else if ( deliveryType === 'upload' ) {
    // upload will actually store the image in the Cloudinary account
    // and subsequently serve that stored image

    // If our image is locally sourced, we need to obtain the full
    // local relative path so that we can tell Cloudinary where
    // to upload from

    let fullPath = filePath;

    if ( !isRemoteUrl(fullPath) ) {
      fullPath = path.join(localDir, fullPath);
    }

    const id = await createPublicId({
      path: fullPath
    });

    const uploadOptions = {
      folder,
      public_id: id,
      overwrite: false
    }

    if ( uploadPreset ) {
      uploadOptions.upload_preset = uploadPreset;
    }

    let results;

    if ( canSignUpload ) {
      // We need an API Key and Secret to use signed uploading

      results = await cloudinary.uploader.upload(fullPath, {
        ...uploadOptions
      });
    } else {
      // If we want to avoid signing our uploads, we don't need our API Key and Secret,
      // however, we need to provide an uploadPreset

      results = await cloudinary.uploader.unsigned_upload(fullPath, uploadPreset, {
        ...uploadOptions
      });
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
 * updateHtmlImagesToCloudinary
 */

async function updateHtmlImagesToCloudinary(html, options = {}) {
  const {
    deliveryType,
    uploadPreset,
    folder,
    localDir,
    remoteHost
  } = options;

  const errors = [];
  const dom = new JSDOM(html);

  const images = Array.from(dom.window.document.querySelectorAll('img'));

  await Promise.all(images.map(async ($img) => {
    const imgSrc = $img.getAttribute('src');
    try {
      const cloudinarySrc = await getCloudinaryUrl({
        deliveryType,
        folder,
        path: imgSrc,
        localDir,
        uploadPreset,
        remoteHost
      });
      $img.setAttribute('src', cloudinarySrc)
    } catch(e) {
      const { error } = e;
      errors.push({
        imgSrc,
        message: e.message || error.message
      });
    }
  }));

  return {
    html: dom.serialize(),
    errors
  }
}

module.exports.updateHtmlImagesToCloudinary = updateHtmlImagesToCloudinary;