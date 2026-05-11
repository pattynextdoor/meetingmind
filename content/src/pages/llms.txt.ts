import type { APIRoute } from 'astro';
import { SITE, AUTHOR } from '~/consts';
import { getPublishedPosts, postUrl, postMarkdownUrl, formatDate } from '~/lib/posts';

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const lines: string[] = [
    `# ${SITE.name}`,
    '',
    `> ${SITE.description}`,
    '',
    'MeetingMind is an Obsidian plugin that imports meeting transcripts from Zoom,',
    'Google Meet, Microsoft Teams, Fireflies.ai, Otter.ai, and any VTT/SRT/TXT file,',
    'then enriches them with auto-linking and (with a Pro license) AI summaries,',
    'action items, decisions, and entity extraction — all running locally with the',
    'user\'s own API keys.',
    '',
    '## Product',
    '',
    `- [Homepage](${SITE.url}/): Product overview, features, pricing.`,
    `- [About](${SITE.url}/about): About the project and the author.`,
    `- [Pro license ($39 one-time)](https://tumbucon.gumroad.com/l/meetingmind-pro): Unlocks AI features. BYOK.`,
    `- [GitHub repository](https://github.com/pattynextdoor/meetingmind): Source code, releases, issues.`,
    '',
    '## Documentation',
    '',
    '- [Documentation home](https://docs.meetingmind.me): Full docs.',
    '- [Getting started](https://docs.meetingmind.me/guide/getting-started): Install, first import.',
    '- [Installation](https://docs.meetingmind.me/guide/installation): Install from GitHub releases.',
    '- [Settings overview](https://docs.meetingmind.me/guide/settings): Configuration reference.',
    '- [Import sources](https://docs.meetingmind.me/guide/sources): All supported sources.',
    '- [Zoom guide](https://docs.meetingmind.me/features/zoom): Import Zoom VTT transcripts.',
    '- [Google Meet guide](https://docs.meetingmind.me/features/google-meet): Import Google Meet transcripts.',
    '- [Microsoft Teams guide](https://docs.meetingmind.me/features/teams): Import Teams .vtt/.docx transcripts.',
    '- [Fireflies guide](https://docs.meetingmind.me/features/fireflies): API sync setup.',
    '- [Otter.ai guide](https://docs.meetingmind.me/features/otter-sync): Otter export workflow.',
    '- [Auto-linking](https://docs.meetingmind.me/features/auto-linking): How vault auto-linking works.',
    '- [Pro overview](https://docs.meetingmind.me/pro/overview): What Pro unlocks.',
    '- [API keys](https://docs.meetingmind.me/pro/api-keys): Configuring Claude or OpenAI keys.',
    '',
    '## Blog',
    '',
    ...(posts.length === 0
      ? ['_No posts yet._', '']
      : posts.map(
          (p) =>
            `- [${p.data.title}](${SITE.url}${postUrl(p)}) (markdown: ${SITE.url}${postMarkdownUrl(p)}) — ${p.data.description} (${formatDate(p.data.publishedAt)})`
        )),
    '',
    '## Contact',
    '',
    `- Author: ${AUTHOR.name} — ${AUTHOR.url}`,
    `- Email: ${AUTHOR.email}`,
    `- GitHub issues: https://github.com/pattynextdoor/meetingmind/issues`,
    '',
    '## Optional',
    '',
    `- [RSS feed](${SITE.url}/feed.xml)`,
    `- [Full content dump for LLMs](${SITE.url}/llms-full.txt)`,
    `- [Sitemap](${SITE.url}/sitemap-index.xml)`,
    '',
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
    },
  });
};
