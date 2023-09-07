import { CldOgImage } from 'next-cloudinary';

interface OgImageProps {
  title: string;
  twitterTitle: string;
}

const OgImage = ({ title, twitterTitle }: OgImageProps) => {
  return (
    <CldOgImage
      src={`assets/cloudinary-social-background`}
      overlays={[
        {
          width: 2000,
          crop: 'fit',
          position: {
            y: -160
          },
          text: {
            color: 'white',
            fontFamily: 'Source Sans Pro',
            fontSize: 200,
            fontWeight: 'black',
            text: title,
            alignment: 'center',
            lineSpacing: -50
          }
        },
        {
          publicId: 'assets/cloudinary-white',
          position: {
            x: -190,
            y: 180,
          },
        },
        {
          publicId: 'assets/netlify-white',
          height: 160,
          position: {
            x: 380,
            y: 190,
          },
        },
        {
          position: {
            y: 320
          },
          text: {
            color: 'white',
            fontFamily: 'Source Sans Pro',
            fontSize: 60,
            fontWeight: 'bold',
            text: 'next.cloudinary.dev'
          }
        }
      ]}
      alt=""
    />
  )
}

export default OgImage;