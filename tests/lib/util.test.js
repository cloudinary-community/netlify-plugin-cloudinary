const { isRemoteUrl, determineRemoteUrl } = require('../../src/lib/util');

describe('lib/util', () => {
  const ENV_ORIGINAL = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ENV_ORIGINAL };
  });

  afterAll(() => {
    process.env = ENV_ORIGINAL;
  });

  describe('isRemoteUrl', () => {
    
    test('should be a remote URL', () => {
      expect(isRemoteUrl('https://cloudinary.com')).toEqual(true);
      expect(isRemoteUrl('http://cloudinary.com')).toEqual(true);
    });
    
    test('should not be a remote URL', () => {
      expect(isRemoteUrl('/images/cloud.jpg')).toEqual(false);
      expect(isRemoteUrl('images/cloud.jpg')).toEqual(false);
    });

  });

  describe('determineRemoteUrl', () => {

    process.env.DEPLOY_PRIME_URL = 'https://cloudinary.netlify.app';
    
    test('should return original value when remote URL', () => {
      expect(determineRemoteUrl('https://cloudinary.com')).toEqual('https://cloudinary.com');
      expect(determineRemoteUrl('http://cloudinary.com')).toEqual('http://cloudinary.com');
    });
    
    test('should prepend DEPLOY_PRIME_URL when local path', () => {
      expect(determineRemoteUrl('/images/cloud.jpg')).toEqual('https://cloudinary.netlify.app/images/cloud.jpg');
      expect(determineRemoteUrl('images/cloud.jpg')).toEqual('https://cloudinary.netlify.app/images/cloud.jpg');
    });

  });

});