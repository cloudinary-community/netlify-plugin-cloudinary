import { useState, useEffect } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'

import dataImages from '../data/images';

export default function Home({ images }) {
  const [isLoaded, setIsLoaded] = useState();

  useEffect(() => {
    setIsLoaded(true);
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Cloudinary Netlify Plugin</title>
        <meta name="description" content="Cloudinary Netlify Plugin" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Cloudinary Netlify Plugin
        </h1>

        <p className={styles.description}>
          Supercharge images on your Netlify site with Cloudinary!
        </p>

        <h2 className={styles.title}>
          Getting Started
        </h2>

        <ul className={styles.description}>
          <li>
            ✅ <a href="https://app.netlify.com/plugins/netlify-plugin-cloudinary/install">Install the plugin on Netlify</a> (or search for &quot;cloudinary&quot;)
          </li>
          <li>
            ✅ Add <code>CLOUDINARY_CLOUD_NAME</code> as a Build Variable
          </li>
          <li>
            ✅ Trigger a new Netlify build
          </li>
        </ul>

        <p className={styles.description}>
          <a href="https://github.com/colbyfayock/netlify-plugin-cloudinary">More details and advanced configuration on GitHub</a>
        </p>

        <h2 className={styles.title}>
          Images Transformed to Use Cloudinary
        </h2>

        <ul className={styles.grid}>
          {images.map(image => {
            return (
              <li key={image.src}>
                <img src={image.src} width={image.width} height={image.height} alt={image.title} />
              </li>
            );
          })}
        </ul>

        {isLoaded && (
          <ul className={styles.grid}>
            {images.map(image => {
              return (
                <li key={image.src}>
                  <img src={image.src} width={image.width} height={image.height} alt={image.title} />
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  )
}

export async function getStaticProps() {
  return {
    props: {
      images: dataImages
    }
  }
}
