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

function determineRemoteUrl(url) {
  if ( isRemoteUrl(url) ) return url;

  if ( !url.startsWith('/') ) {
    url = `/${url}`;
  }

  url = `${process.env.DEPLOY_PRIME_URL}${url}`;

  return url;
}

module.exports.determineRemoteUrl = determineRemoteUrl;