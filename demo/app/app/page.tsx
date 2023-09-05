import '../../styles/globals.css';
import Image from 'next/image';
import styles from '../../styles/Home.module.css';

import images from '../../data/images.json';

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Cloudinary Netlify Plugin</h1>

        <ul className={styles.grid}>
          {images.map((image) => {
            return (
              <li key={image.src}>
                <img
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.title}
                />
              </li>
            );
          })}
        </ul>

        <ul className={styles.grid}>
          {images.map((image) => {
            return (
              <li key={image.src}>
                <Image
                  src={image.src}
                  width={image.width}
                  height={image.height}
                  alt={image.title}
                />
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
