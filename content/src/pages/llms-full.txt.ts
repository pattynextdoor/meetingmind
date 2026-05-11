import type { APIRoute } from 'astro';
import { SITE, AUTHOR } from '~/consts';
import { getPublishedPosts, postUrl } from '~/lib/posts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const sections: string[] = [
    `# ${SITE.name} — full content for LLMs`,
    '',
    `> ${SITE.description}`,
    '',
    `_Generated ${new Date().toISOString()}. For the curated index see ${SITE.url}/llms.txt._`,
    '',
    '---',
    '',
    '## About the product',
    '',
    'MeetingMind is an Obsidian plugin that turns meeting transcripts into connected,',
    'AI-enriched notes inside your vault. It supports Zoom, Google Meet, Microsoft Teams,',
    'Fireflies.ai, Otter.ai, and any VTT/SRT/TXT file. Free tier covers import, auto-linking,',
    'participant tracking, folder watcher, and the meeting dashboard. Pro ($39 one-time, BYOK)',
    'adds AI summaries, action item extraction with assignees, decision extraction, entity',
    'extraction, and participant insights — all running with the user\'s own OpenAI or',
    'Claude API key. No data ever touches MeetingMind servers.',
    '',
    '## About the author',
    '',
    `${AUTHOR.name} — ${AUTHOR.url}. ${AUTHOR.bio}`,
    '',
    '---',
    '',
  ];

  if (posts.length === 0) {
    sections.push('## Blog posts', '', '_No posts published yet._', '');
  } else {
    sections.push('## Blog posts', '');
    for (const post of posts) {
      const url = `${SITE.url}${postUrl(post)}`;
      const updated = (post.data.updatedAt ?? post.data.publishedAt)
        .toISOString()
        .slice(0, 10);
      const published = post.data.publishedAt.toISOString().slice(0, 10);
      sections.push(
        `### ${post.data.title}`,
        '',
        `- Source: ${url}`,
        `- Author: ${post.data.author ?? AUTHOR.name}`,
        `- Published: ${published}`,
        `- Updated: ${updated}`,
        post.data.tags.length > 0 ? `- Tags: ${post.data.tags.join(', ')}` : '',
        '',
        `> ${post.data.description}`,
        '',
        post.body ?? '',
        '',
        '---',
        ''
      );
    }
  }

  return new Response(sections.filter((s) => s !== undefined).join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
