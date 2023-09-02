"use strict";
/**
 * isRemoteUrl
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueryParams = exports.determineRemoteUrl = exports.isRemoteUrl = void 0;
function isRemoteUrl(url) {
    return url.startsWith('http');
}
exports.isRemoteUrl = isRemoteUrl;
/**
 * determineRemoteUrl
 */
function determineRemoteUrl(url, host) {
    if (isRemoteUrl(url))
        return url;
    if (!url.startsWith('/')) {
        url = `/${url}`;
    }
    url = `${host}${url}`;
    return url;
}
exports.determineRemoteUrl = determineRemoteUrl;
/**
 * getQueryParams
 */
function getQueryParams(url) {
    if (typeof url !== 'string') {
        throw new Error('Can not getQueryParams. Invalid URL');
    }
    const params = {};
    const urlSegments = url.split('?');
    urlSegments[1] &&
        urlSegments[1].split('&').forEach(segment => {
            const [key, value] = segment.split('=');
            //@ts-expect-error TS can't check if key is in effect key of params
            params[key] = value;
        });
    return params;
}
exports.getQueryParams = getQueryParams;
