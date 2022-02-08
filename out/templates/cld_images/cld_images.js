'use strict';

const { getQueryParams } = require('../../lib/util');

exports.handler = async function (event, context) {
  const { rawUrl } = event;

  const rawUrlSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = rawUrlSegments[0].replace(/\/$/, '');
  const pathSegments = rawUrlSegments[1].split('?');
  const imagePath = `/cld-assets/images${pathSegments[0]}`;

  getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;

  const remoteUrl = encodeURIComponent(`${endpoint}${imagePath}`);

  const cloudinaryUrl = `https://res.cloudinary.com/colbydemo/image/fetch/f_auto,q_auto/${remoteUrl}`;

  console.log({
    rawUrl,
    pathSegments,
    imagePath,
    cloudName,
    endpoint,
    imagePath,
    remoteUrl,
    cloudinaryUrl
  });

  return {
    statusCode: 302,
    headers: {
      Location: cloudinaryUrl
    }
  };
};
