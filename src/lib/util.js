/**
 * isRemoteUrl
 */

function isRemoteUrl(url) {
  return url.startsWith('http');
}

module.exports.isRemoteUrl = isRemoteUrl;

/**
 * determineRemoteUrl
 */

function determineRemoteUrl(url, host) {
  if ( isRemoteUrl(url) ) return url;

  if ( !url.startsWith('/') ) {
    url = `/${url}`;
  }

  url = `${host}${url}`;

  return url;
}

module.exports.determineRemoteUrl = determineRemoteUrl;

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