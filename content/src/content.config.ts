import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const faqItem = z.object({
  q: z.string(),
  a: z.string(),
});

const howtoStep = z.object({
  name: z.string(),
  text: z.string(),
  image: z.string().optional(),
  url: z.string().optional(),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(70, 'Title should be ≤ 70 chars for SERP display'),
      description: z
        .string()
        .max(170, 'Description should be ≤ 170 chars for SERP display'),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default('Patrick Tumbucon'),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      ogImage: image().optional(),
      canonical: z.string().url().optional(),
      noindex: z.boolean().default(false),
      // Optional rich-result blocks — populate frontmatter to emit schema.
      faq: z.array(faqItem).optional(),
      howto: z
        .object({
          name: z.string(),
          description: z.string(),
          totalTime: z.string().optional(),
          steps: z.array(howtoStep).min(2),
        })
        .optional(),
    }),
});

export const collections = { blog };
