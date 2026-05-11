import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { SITE } from '~/consts';
import { getPublishedPosts, postUrl } from '~/lib/posts';

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();
  return rss({
    title: `${SITE.name} Blog`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      link: postUrl(post),
      pubDate: post.data.publishedAt,
      categories: post.data.tags,
      author: post.data.author,
    })),
    customData: `<language>en-us</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
};
