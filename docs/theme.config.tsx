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
  footer: {
    text: `MIT ${new Date().getFullYear()} © Colby Fayock`,
  },
  sidebar: {
    autoCollapse: true,
    defaultMenuCollapseLevel: 1
  }
}

export default config
