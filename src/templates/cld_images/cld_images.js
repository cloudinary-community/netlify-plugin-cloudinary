exports.handler = async function (event, context) {
  const { rawUrl } = event;

  const rawUrlSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = rawUrlSegments[0].replace(/\/$/, '');
  const pathSegments = rawUrlSegments[1].split('?');
  const imagePath = `/cld-assets/images${pathSegments[0]}`;

  const { deliveryType, uploadPreset } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;

  const remoteUrl = encodeURIComponent(`${endpoint}${imagePath}`);

  const cloudinaryUrl = `https://res.cloudinary.com/colbydemo/image/fetch/f_auto,q_auto/${remoteUrl}`

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

/**
 * getQueryParams
 */

function getQueryParams(url) {
  if ( typeof url !== 'string') {
    throw new Error('Can not getQueryParams. Invalid URL');
  }

  const params = {};

  const urlSegments = url.split('?');

  urlSegments[1] && urlSegments[1].split('&').forEach(segment => {
    const [key, value] = segment.split('=');
    params[key] = value;
  });

  return params;
}

module.exports.getQueryParams = getQueryParams;