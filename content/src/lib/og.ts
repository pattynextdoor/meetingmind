import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

// Resolve the cache dir from the project root (process.cwd() is content/ at
// build time) so it lives OUTSIDE the bundled output and never ends up in dist/.
const CACHE_DIR = resolve(process.cwd(), '.astro/cache/og');
const FONT_PATH = resolve(CACHE_DIR, 'inter-regular.ttf');
const FONT_BOLD_PATH = resolve(CACHE_DIR, 'inter-bold.ttf');

// Fontsource serves Inter directly as TTF over their free CDN. No key needed.
const FONT_URL =
  'https://api.fontsource.org/v1/fonts/inter/latin-400-normal.ttf';
const FONT_BOLD_URL =
  'https://api.fontsource.org/v1/fonts/inter/latin-700-normal.ttf';

async function fetchAndCache(url: string, dest: string): Promise<Buffer | null> {
  if (existsSync(dest)) return readFileSync(dest);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, buf);
    return buf;
  } catch {
    return null;
  }
}

export async function loadFonts(): Promise<
  | { regular: Buffer; bold: Buffer }
  | null
> {
  const [regular, bold] = await Promise.all([
    fetchAndCache(FONT_URL, FONT_PATH),
    fetchAndCache(FONT_BOLD_URL, FONT_BOLD_PATH),
  ]);
  if (!regular || !bold) return null;
  return { regular, bold };
}

export interface OgInput {
  title: string;
  description?: string;
  author?: string;
  publishedAt?: Date;
  tags?: string[];
}

export function ogTemplate(input: OgInput): Record<string, unknown> {
  const dateLabel = input.publishedAt
    ? input.publishedAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  return {
    type: 'div',
    props: {
      style: {
        width: '1200px',
        height: '630px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background: 'linear-gradient(135deg, #faf9f7 0%, #f5f3ef 100%)',
        fontFamily: 'Inter',
        color: '#1a1a1a',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: '#065f46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#faf9f7',
                    fontSize: '22px',
                    fontWeight: 700,
                  },
                  children: 'M',
                },
              },
              {
                type: 'span',
                props: { children: 'MeetingMind' },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            },
            children: [
              {
                type: 'h1',
                props: {
                  style: {
                    fontSize: input.title.length > 60 ? '56px' : '68px',
                    fontWeight: 700,
                    letterSpacing: '-0.025em',
                    lineHeight: 1.08,
                    margin: 0,
                    color: '#1a1a1a',
                  },
                  children: input.title,
                },
              },
              ...(input.description
                ? [
                    {
                      type: 'p',
                      props: {
                        style: {
                          fontSize: '26px',
                          lineHeight: 1.4,
                          margin: 0,
                          color: '#57534e',
                        },
                        children: input.description,
                      },
                    },
                  ]
                : []),
            ],
          },
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '20px',
              color: '#78716c',
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', gap: '14px', alignItems: 'center' },
                  children: [
                    input.author ?? 'Patrick Tumbucon',
                    dateLabel ? ` ·  ${dateLabel}` : '',
                  ].filter(Boolean),
                },
              },
              {
                type: 'div',
                props: {
                  style: { color: '#065f46', fontWeight: 700 },
                  children: 'meetingmind.me',
                },
              },
            ],
          },
        },
      ],
    },
  };
}
