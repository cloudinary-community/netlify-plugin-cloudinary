const { createPublicId } = require('../../src/lib/cloudinary');

describe('lib/util', () => {

  describe('createPublicId', () => {
    
    test('should create a public ID from a remote URL', async () => {
      const mikeId = await createPublicId({ path: 'https://i.imgur.com/e6XK75j.png' });
      expect(mikeId).toEqual('e6XK75j-58e290136642a9c711afa6410b07848d');

      const lucasId = await createPublicId({ path: 'https://i.imgur.com/vtYmp1x.png' });
      expect(lucasId).toEqual('vtYmp1x-ae71a79c9c36b8d5dba872c3b274a444');
    });
    
    test('should create a public ID from a local image', async () => {
      const dustinId = await createPublicId({ path: '../images/stranger-things-dustin.jpeg' });
      expect(dustinId).toEqual('stranger-things-dustin-9a2a7b1501695c50ad85c329f79fb184');
      
      const elevenId = await createPublicId({ path: '../images/stranger-things-eleven.jpeg' });
      expect(elevenId).toEqual('stranger-things-eleven-c5486e412115dbeba03315959c3a6d20');
    });

  });

});