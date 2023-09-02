/**
 * isRemoteUrl
 */

export function isRemoteUrl(url: string) {
  return url.startsWith('http')
}


/**
 * determineRemoteUrl
 */

export function determineRemoteUrl(url:string, host: string) {
  if (isRemoteUrl(url)) return url

  if (!url.startsWith('/')) {
    url = `/${url}`
  }

  url = `${host}${url}`

  return url
}


/**
 * getQueryParams
 */


export function getQueryParams(url: string) {
  if (typeof url !== 'string') {
    throw new Error('Can not getQueryParams. Invalid URL')
  }

  const params = {}

  const urlSegments = url.split('?')

  urlSegments[1] &&
    urlSegments[1].split('&').forEach(segment => {
      const [key, value] = segment.split('=')
      //@ts-expect-error TS can't check if key is in effect key of params
      params[key] = value
    })

  return params
}

