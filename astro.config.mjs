// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://beautyfacelift.ch',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin') && !page.includes('/lp/') && !page.includes('/buchung-bestaetigt'),
      changefreq: 'weekly',
      priority: 0.7,
      serialize(item) {
        // Boost homepage and key pages
        if (item.url === 'https://beautyfacelift.ch/') {
          item.priority = 1.0;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/behandlungen/') && !item.url.includes('/vergleich')) {
          item.priority = 0.9;
          item.changefreq = 'weekly';
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        } else if (item.url.includes('/termin/')) {
          item.priority = 0.8;
          item.changefreq = 'monthly';
        }
        return item;
      },
    }),
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
