const { isRemoteUrl, determineRemoteUrl } = require('../../src/lib/util');

describe('lib/util', () => {

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
    
    test('should return original value when remote URL', () => {
      const secure = determineRemoteUrl('https://cloudinary.com', 'https://cloudinary.netlify.app');
      expect(secure).toEqual('https://cloudinary.com');

      const notSecure = determineRemoteUrl('http://cloudinary.com', 'https://cloudinary.netlify.app');
      expect(notSecure).toEqual('http://cloudinary.com');
    });
    
    test('should prepend DEPLOY_PRIME_URL when local path', () => {
      const withStartingSlash = determineRemoteUrl('/images/cloud.jpg', 'https://cloudinary.netlify.app');
      expect(withStartingSlash).toEqual('https://cloudinary.netlify.app/images/cloud.jpg');

      const withoutStartingSlash = determineRemoteUrl('images/cloud.jpg', 'https://cloudinary.netlify.app');
      expect(withoutStartingSlash).toEqual('https://cloudinary.netlify.app/images/cloud.jpg');
    });

  });

});