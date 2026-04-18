# CLAUDE.md — Word Blog

## Project Overview

Static blog at `word.247base.uk`. Astro v6 + Tailwind CSS v4 + Sveltia CMS. Deployed on Cloudflare Pages.

## Tech Stack

- Astro v6.1.3 (static output, Content Layer API with `glob()` loader + Zod schemas)
- Tailwind CSS v4 (via `@tailwindcss/vite` plugin, CSS-first config in `src/styles/global.css`)
- Sveltia CMS (git-based, admin at `/admin/`)
- Cloudflare Pages (GitHub-linked auto-deploy on push to `main`)

## Key Files

| File | Purpose |
|:--|:--|
| `astro.config.mjs` | Astro config — site URL, Tailwind v4 plugin, sitemap |
| `src/content.config.ts` | Content collections — `posts` collection with Zod schema |
| `src/consts.ts` | Site title and description constants |
| `src/styles/global.css` | Tailwind v4 imports + custom theme tokens |
| `public/admin/config.yml` | Sveltia CMS collection config (must match content schema) |
| `wrangler.toml` | Cloudflare Pages deployment config |

## Content Schema

Posts live in `src/content/posts/` as Markdown files. Frontmatter fields:

- `title` (string, required)
- `description` (string, required)
- `pubDate` (date, required)
- `updatedDate` (date, optional)
- `heroImage` (string path, optional)
- `category` (string, default: `uncategorized`)
- `tags` (string[], default: `[]`)
- `draft` (boolean, default: `false`) — draft posts are filtered out in production

## Architecture

- **Layouts**: `BaseLayout.astro` (HTML shell + SEO + header/footer), `BlogPostLayout.astro` (article wrapper)
- **Components**: `SEO.astro` (meta/OG/JSON-LD), `PostCard.astro`, `TagList.astro`, `CategoryList.astro`, `Header.astro`, `Footer.astro`
- **Pages**: Index, blog listing, individual posts (`[...id]`), tag/category indexes and filtered views, about page, RSS feed
- **Static output**: All pages pre-built at build time. Zero server runtime.

## Commands

```bash
npm run dev          # Dev server at localhost:4321
npm run build        # Build to ./dist/
npm run preview      # Preview build locally
```

## Deployment

- GitHub repo: `log1104/word`
- Cloudflare Pages project: `word`
- Custom domain: `word.247base.uk`
- Manual deploy: `npx wrangler pages deploy dist --project-name word`

## Conventions

- Collection name is `posts` (not `blog`)
- Post URLs: `/blog/{id}/`
- Tag URLs: `/tags/{tag}`
- Category URLs: `/categories/{category}`
- Draft filtering: `getCollection('posts', ({ data }) => !data.draft)`
- Tailwind: custom colors `primary` (#2563eb) and `accent` (#7c3aed)
