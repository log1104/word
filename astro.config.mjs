// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import rehypeChatBubbles from './src/plugins/rehype-chat-bubbles.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://word.247base.uk',
	output: 'static',
	compressHTML: true,
	integrations: [sitemap()],
	markdown: {
		rehypePlugins: [rehypeChatBubbles],
	},
	vite: {
		plugins: [tailwindcss()],
	},
});
