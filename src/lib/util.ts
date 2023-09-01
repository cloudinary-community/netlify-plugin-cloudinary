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


class InvariantError extends Error  {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, InvariantError.prototype)
  }
}
export function getQueryParams(url: string) {
  if (typeof url !== 'string') {
    throw new Error('Can not getQueryParams. Invalid URL')
  }

  const params = {}

  const urlSegments = url.split('?')

  urlSegments[1] &&
    urlSegments[1].split('&').forEach(segment => {
      const [key, value] = segment.split('=')
      //@ts-ignore TODO: fix this
      params[key] = value
    })

  return params
}


export function invariant(condition: any, message?: string | (() => string)): asserts condition{
  if(condition)  {
    return
  }

  const msg = typeof message === 'function' ? message(): message

  throw new InvariantError(msg || 'invariant error')
}
