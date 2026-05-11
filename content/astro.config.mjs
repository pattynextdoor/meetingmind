// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const SITE = 'https://meetingmind.me';

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    mdx(),
    sitemap({
      // The Vite SPA owns / — include it explicitly so it appears in the sitemap.
      customPages: [`${SITE}/`],
      filter: (page) =>
        !page.includes('/og.png') && !page.endsWith('.md'),
      serialize(item) {
        return {
          ...item,
          changefreq: item.url.includes('/blog/') ? 'monthly' : 'weekly',
          priority: item.url === `${SITE}/` ? 1.0 : 0.7,
        };
      },
    }),
  ],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-dimmed',
      },
      wrap: true,
    },
  },
});
