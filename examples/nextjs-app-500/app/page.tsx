import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
})

interface CloudinaryResource {
  height: number;
  public_id: string;
  secure_url: string;
  width: number;
}

export default async function Home() {
  const photos: { resources: Array<CloudinaryResource> } = await cloudinary.api.resources({
    max_results: 500
  });
  return (
    <main>
      <ul className="grid grid-cols-4">
        {photos.resources.map(photo => {
          return (
            <li key={photo.public_id}>
              <img
                src={photo.secure_url}
                alt="Next.js Logo"
                width={photo.width}
                height={photo.height}
                loading="lazy"
              />
            </li>
          )
        })}
      </ul>
    </main>
  )
}
