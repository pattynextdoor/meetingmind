import type { APIRoute, GetStaticPaths } from 'astro';
import { getPublishedPosts } from '~/lib/posts';
import { AUTHOR, SITE } from '~/consts';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({
    params: { slug: post.id.replace(/\.(md|mdx)$/, '') },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const post = props.post as Awaited<ReturnType<typeof getPublishedPosts>>[number];
  const canonical = `${SITE.url}/blog/${post.id.replace(/\.(md|mdx)$/, '')}`;
  const updated = (post.data.updatedAt ?? post.data.publishedAt).toISOString().slice(0, 10);
  const published = post.data.publishedAt.toISOString().slice(0, 10);

  const headerLines: string[] = [
    `# ${post.data.title}`,
    '',
    `> ${post.data.description}`,
    '',
    `- Source: ${canonical}`,
    `- Author: ${post.data.author ?? AUTHOR.name} (${AUTHOR.url})`,
    `- Published: ${published}`,
    `- Updated: ${updated}`,
  ];
  if (post.data.tags.length > 0) {
    headerLines.push(`- Tags: ${post.data.tags.join(', ')}`);
  }
  headerLines.push('', '---', '', '');

  // Strip MDX `import` statements — they're build-time scaffolding, not content,
  // and would just confuse an LLM consuming the markdown variant.
  const body = (post.body ?? '')
    .replace(/^import\s+.+?from\s+['"].+?['"];?\s*$/gm, '')
    .replace(/^\n+/, '');

  return new Response(headerLines.join('\n') + body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
