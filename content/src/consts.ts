export const SITE = {
  url: 'https://meetingmind.me',
  name: 'MeetingMind',
  title: 'MeetingMind — Meeting transcripts that actually connect',
  description:
    'Turn meeting transcripts into connected Obsidian notes. Auto-import from Fireflies, Otter, Zoom. AI summaries, action items, auto-linking.',
  ogImageFallback: '/meetingmind_logo_600.png',
  locale: 'en-US',
} as const;

export const AUTHOR = {
  name: 'Patrick Tumbucon',
  url: 'https://patricktumbucon.com',
  email: 'patricktumbucon@gmail.com',
  github: 'https://github.com/pattynextdoor',
  linkedin: 'https://linkedin.com/in/patricktumbucon',
  bio: 'Builder of MeetingMind. I enjoy problem solving with a bit of whimsy. In my spare time, I stare at my planted aquariums, tend to my garden, hang out outdoors with my corgi, and play fighting games.',
} as const;

export const ORG = {
  name: 'MeetingMind',
  url: SITE.url,
  logo: `${SITE.url}/meetingmind_logo_600.png`,
  sameAs: [
    'https://github.com/pattynextdoor/meetingmind',
    'https://tumbucon.gumroad.com/l/meetingmind-pro',
    'https://www.producthunt.com/products/meetingmind',
    AUTHOR.url,
  ],
  founder: {
    name: AUTHOR.name,
    url: AUTHOR.url,
  },
} as const;

export const PRODUCT_PRO = {
  name: 'MeetingMind Pro',
  description:
    'One-time license unlocking AI summaries, action items, decisions, entity extraction, and participant insights. BYOK (OpenAI/Claude).',
  price: '39',
  currency: 'USD',
  url: 'https://tumbucon.gumroad.com/l/meetingmind-pro',
} as const;
