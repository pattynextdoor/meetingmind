import type { APIRoute, GetStaticPaths } from 'astro';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { getPublishedPosts } from '~/lib/posts';
import { loadFonts, ogTemplate } from '~/lib/og';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.(md|mdx)$/, '') },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Awaited<ReturnType<typeof getPublishedPosts>>[number];
  const fonts = await loadFonts();
  if (!fonts) {
    // Sensible fallback: redirect to the static logo if fonts could not be loaded.
    return Response.redirect('https://meetingmind.me/meetingmind_logo_600.png', 302);
  }

  const node = ogTemplate({
    title: post.data.title,
    description: post.data.description,
    author: post.data.author,
    publishedAt: post.data.publishedAt,
    tags: post.data.tags,
  });

  const svg = await satori(node as never, {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Inter', data: fonts.regular, weight: 400, style: 'normal' },
      { name: 'Inter', data: fonts.bold, weight: 700, style: 'normal' },
    ],
  });

  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } })
    .render()
    .asPng();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
