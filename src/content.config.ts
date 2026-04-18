import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const optionalDate = z.preprocess(
	(val) => (val === '' || val === undefined || val === null) ? undefined : val,
	z.coerce.date().optional()
);

const optionalString = z.preprocess(
	(val) => (val === '' || val === undefined || val === null) ? undefined : val,
	z.string().optional()
);

const posts = defineCollection({
	loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: optionalDate,
		heroImage: optionalString,
		tags: z.array(z.string()).default([]),
		category: z.string().default('uncategorized'),
		draft: z.boolean().default(false),
	}),
});

export const collections = { posts };
