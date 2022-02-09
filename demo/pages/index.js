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
          <a href="https://github.com/colbyfayock/netlify-plugin-cloudinary">https://github.com/colbyfayock/netlify-plugin-cloudinary</a>
        </p>

        <div className={styles.grid}>
          {images.map(image => {
            return (
              <li key={image.src}>
                <img src={image.src} width={image.width} height={image.height} alt={image.title} />
              </li>
            );
          })}
        </div>
          {isLoaded && (
            <div className={styles.grid}>
              {images.map(image => {
                return (
                  <li key={image.src}>
                    <img src={image.src} width={image.width} height={image.height} alt={image.title} />
                  </li>
                );
              })}
            </div>
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
