import React from 'react';
import { useRouter } from 'next/router';
import { DocsThemeConfig } from 'nextra-theme-docs'

const config: DocsThemeConfig = {
  logo: <strong>Netlify Cloudinary</strong>,
  project: {
    link: 'https://github.com/cloudinary-community/netlify-plugin-cloudinary',
  },
  docsRepositoryBase: 'https://github.com/cloudinary-community/netlify-plugin-cloudinary',
  useNextSeoProps() {
    const { route } = useRouter()
    if (route !== '/') {
      return {
        titleTemplate: '%s – Netlify Cloudinary'
      }
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <title>Netlify Cloudinary - Automatic Optimization at Scale</title>
      <meta name="description" content="Optimize and deliver all images in your Netlify site with Cloudinary." />
      <meta name="og:title" content="Netlify Cloudinary - Automatic Optimization at Scale" />
      <meta name="og:description" content="Optimize and deliver all images in your Netlify site with Cloudinary." />
      <meta name="og:type" content="website" />

      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <meta name="theme-color" content="#000000" />
    </>
  ),
  footer: {
    text: `MIT ${new Date().getFullYear()} © Colby Fayock`,
  },
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1
  }
}

export default config
