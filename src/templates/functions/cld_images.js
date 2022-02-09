const { builder } = require('@netlify/functions');

const { getQueryParams } = require('../../lib/util');
const { configureCloudinary, getCloudinaryUrl } = require('../../lib/cloudinary');
const { PUBLIC_ASSET_PATH } = require('../../data/cloudinary');

async function handler(event, context) {
  const { rawUrl, headers } = event;
  const { host } = headers;

  const { deliveryType, uploadPreset, folder, path, ...queryParams } = getQueryParams(rawUrl);
  const mediaPath = `/${PUBLIC_ASSET_PATH}/${path}`;
  const remoteUrl = `https://${host}${mediaPath}`;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if ( !cloudName ) {
    throw new Error('Cloudinary Cloud Name required. Please set cloudName input or use environment variable CLOUDINARY_CLOUD_NAME');
  }

  configureCloudinary({
    cloudName,
    apiKey,
    apiSecret
  });

  const cloudinaryUrl = await getCloudinaryUrl({
    deliveryType,
    folder,
    path: remoteUrl,
    uploadPreset
  });

  return {
    statusCode: 302,
    headers: {
      Location: cloudinaryUrl
    }
  };
};

exports.handler = builder(handler);