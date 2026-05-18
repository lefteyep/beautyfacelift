// @ts-check
import { copyFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';

const SITE_URL = 'https://beautyfacelift-zuerich.ch';

const NOINDEX_PATHS = [
  '/admin/',
  '/lp/',
  '/buchung-bestaetigt/',
  '/kontakt/danke/',
  '/termin/',
];

function sitemapXmlAlias() {
  return {
    name: 'sitemap-xml-alias',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        await copyFile(new URL('sitemap-0.xml', dir), new URL('sitemap.xml', dir));
      },
    },
  };
}

export default defineConfig({
  site: SITE_URL,
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => {
        const { pathname } = new URL(page);
        return !NOINDEX_PATHS.some((path) => pathname.startsWith(path));
      },
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        // Boost homepage and key pages
        if (item.url === `${SITE_URL}/`) {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/behandlungen/') && !item.url.includes('/vergleich')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
    sitemapXmlAlias(),
    react(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    build: {
      cssMinify: true,
    },
  },
});
