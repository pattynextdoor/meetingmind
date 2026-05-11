import { getCollection, type CollectionEntry } from 'astro:content';
import readingTime from 'reading-time';

export type Post = CollectionEntry<'blog'>;

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await getCollection(
    'blog',
    ({ data }) => import.meta.env.PROD === false || data.draft === false
  );
  return posts.sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime()
  );
}

export function postUrl(post: Post): string {
  return `/blog/${post.id.replace(/\.(md|mdx)$/, '')}`;
}

export function postMarkdownUrl(post: Post): string {
  return `${postUrl(post)}.md`;
}

export function ogImageUrl(post: Post): string {
  return `${postUrl(post)}/og.png`;
}

export function estimateReadingMinutes(body: string | undefined): number {
  if (!body) return 1;
  const { minutes } = readingTime(body);
  return Math.max(1, Math.round(minutes));
}

export function relatedPosts(current: Post, all: Post[], limit = 3): Post[] {
  const currentTags = new Set(current.data.tags);
  if (currentTags.size === 0) return [];
  return all
    .filter((p) => p.id !== current.id)
    .map((p) => ({
      post: p,
      score: p.data.tags.filter((t) => currentTags.has(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post);
}

export function formatDate(d: Date): string {
  // Display dates in UTC so a YAML `publishedAt: 2026-05-15` always renders as
  // May 15, regardless of the build server's local timezone. Without this, a
  // build running west of UTC shifts the displayed date back a day.
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function isoDate(d: Date): string {
  return d.toISOString();
}
