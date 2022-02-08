/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 103:
/***/ ((module) => {

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

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
const { getQueryParams } = __nccwpck_require__(103);

exports.handler = async function (event, context) {
  const { rawUrl } = event;

  const rawUrlSegments = rawUrl.split('.netlify/functions/cld_images');
  const endpoint = rawUrlSegments[0].replace(/\/$/, '');
  const pathSegments = rawUrlSegments[1].split('?');
  const imagePath = `/cld-assets/images${pathSegments[0]}`;

  const { deliveryType } = getQueryParams(rawUrl);

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || queryParams.cloudName;

  const remoteUrl = encodeURIComponent(`${endpoint}${imagePath}`);

  const cloudinaryUrl = `https://res.cloudinary.com/${cloudName}/image/${deliveryType}/f_auto,q_auto/${remoteUrl}`

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
})();

module.exports = __webpack_exports__;
/******/ })()
;