const crypto = require('crypto');
const path = require('path');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');
const cloudinary = require('cloudinary').v2;

const { isRemoteUrl, determineRemoteUrl } = require('./util');

/**
 * getCloudinary
 */

function getCloudinary(config) {
  if ( !config ) return cloudinary;
  return configureCloudinary(config);
}

module.exports.getCloudinary = getCloudinary;

/**
 * configureCloudinary
 */

function configureCloudinary(config = {}) {
  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret
  });
  return cloudinary;
}

module.exports.configureCloudinary = configureCloudinary;

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
  let publicId;

  if ( deliveryType === 'fetch' ) {
    // fetch allows us to pass in a remote URL to the Cloudinary API
    // which it will cache and serve from the CDN, but not store

    fileLocation = determineRemoteUrl(filePath, remoteHost);
    publicId = fileLocation;
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
    publicId = public_id;
    fileLocation = fullPath;
  }

  const cloudinaryUrl = cloudinary.url(publicId, {
    type: deliveryType,
    secure: true,
    transformation: [
      {
        fetch_format: 'auto',
        quality: 'auto'
      }
    ]
  });

  return {
    sourceUrl: fileLocation,
    cloudinaryUrl,
    publicId
  };
}

module.exports.getCloudinaryUrl = getCloudinaryUrl;

/**
 * updateHtmlImagesToCloudinary
 */

async function updateHtmlImagesToCloudinary(html, options = {}) {
  const {
    assets,
    deliveryType,
    uploadPreset,
    folder,
    localDir,
    remoteHost
  } = options;

  const errors = [];
  const dom = new JSDOM(html);

  // Loop through all images found in the DOM and swap the source with
  // a Cloudinary URL

  const images = Array.from(dom.window.document.querySelectorAll('img'));

  for ( const $img of images ) {
    let imgSrc = $img.getAttribute('src');
    let cloudinaryUrl;

    // Check to see if we have an existing asset already to pick from
    // Look at both the path and full URL

    const asset = assets && Array.isArray(assets.images) && assets.images.find(({ publishPath, publishUrl } = {}) => {
      return [publishPath, publishUrl].includes(imgSrc);
    });

    if ( asset ) {
      cloudinaryUrl = asset.cloudinaryUrl;
    }

    // If we don't have an asset and thus don't have a Cloudinary URL, create
    // one for our asset

    if ( !cloudinaryUrl ) {
      try {
        const { cloudinaryUrl: url } = await getCloudinaryUrl({
          deliveryType,
          folder,
          path: imgSrc,
          localDir,
          uploadPreset,
          remoteHost
        });
        cloudinaryUrl = url;
      } catch(e) {
        const { error } = e;
        errors.push({
          imgSrc,
          message: e.message || error.message
        });
        continue;
      }
    }

    $img.setAttribute('src', cloudinaryUrl)
  }

  return {
    html: dom.serialize(),
    errors
  }
}

module.exports.updateHtmlImagesToCloudinary = updateHtmlImagesToCloudinary;