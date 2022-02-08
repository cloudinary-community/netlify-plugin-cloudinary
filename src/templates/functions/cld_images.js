const { getQueryParams } = require('../../lib/util');
const { getCloudinary, getCloudinaryUrl } = require('../../lib/cloudinary');

exports.handler = async function (event, context) {
  const { rawUrl } = event;

  const rawUrlSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = rawUrlSegments[0].replace(/\/$/, '');
  const pathSegments = rawUrlSegments[1].split('?');
  const imagePath = `/cld-assets/images${pathSegments[0]}`;

  const { deliveryType } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if ( !cloudName ) {
    throw new Error('Cloudinary Cloud Name required. Please set cloudName input or use environment variable CLOUDINARY_CLOUD_NAME');
  }

  getCloudinary({
    cloudName,
    apiKey,
    apiSecret
  });


  const remoteUrl = encodeURIComponent(`${endpoint}${imagePath}`);

  const cloudinaryUrl = await getCloudinaryUrl({
    deliveryType,
    path: imagePath,
    remoteHost: endpoint
  });

  console.log({
    rawUrl,
    pathSegments,
    imagePath,
    cloudName,
    endpoint,
    imagePath,
    remoteUrl,
    cloudinaryUrl
  })

  return {
    statusCode: 302,
    headers: {
      Location: cloudinaryUrl
    }
  };
};