// @ts-check
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import sitemap, { ChangeFreqEnum } from '@astrojs/sitemap';
import react from '@astrojs/react';

const SITE_URL = 'https://beautyfacelift-zuerich.ch';

const NOINDEX_PATHS = [
  '/admin/',
  '/lp/',
  '/buchung-bestaetigt/',
  '/kontakt/danke/',
  '/termin/',
];

/**
 * After @astrojs/sitemap: adds <lastmod> for pages that state their own modified date
 * (Wissen articles, via article:modified_time), then copies sitemap-0.xml to sitemap.xml.
 * Pages without such a date get no lastmod rather than a guessed one.
 * @returns {import('astro').AstroIntegration}
 */
function sitemapLastmodAndAlias() {
  return {
    name: 'sitemap-lastmod-and-alias',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        const sitemapFile = new URL('sitemap-0.xml', dir);
        let xml = await readFile(sitemapFile, 'utf8');
        let articles = 0;
        let dated = 0;
        for (const [, loc] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
          const { pathname } = new URL(loc);
          if (/^\/blog\/[^/]+\/$/.test(pathname)) articles++;
          const pageFile = new URL(`.${pathname}index.html`, dir);
          const html = await readFile(pageFile, 'utf8').catch(() => '');
          const modified = html.match(/<meta property="article:modified_time" content="([^"]+)"/)?.[1];
          if (modified) {
            xml = xml.replace(`<loc>${loc}</loc>`, `<loc>${loc}</loc><lastmod>${modified}</lastmod>`);
            dated++;
          }
        }
        // Every article has a modified date (_posts.ts), so a shortfall means the lookup broke
        // (page path, file layout or meta markup changed): fail instead of losing lastmod silently.
        if (dated < articles) {
          throw new Error(`sitemap lastmod: ${dated} of ${articles} Wissen articles got a date`);
        }
        await writeFile(sitemapFile, xml);
        await copyFile(sitemapFile, new URL('sitemap.xml', dir));
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
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.includes('/behandlungen/') && !item.url.includes('/vergleich')) {
          item.priority = 0.9;
          item.changefreq = ChangeFreqEnum.WEEKLY;
        } else if (item.url.includes('/blog/')) {
          item.priority = 0.8;
          item.changefreq = ChangeFreqEnum.MONTHLY;
        }
        return item;
      },
    }),
    sitemapLastmodAndAlias(),
    react(),
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
