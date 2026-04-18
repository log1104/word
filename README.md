# Word

A static blog at [word.247base.uk](https://word.247base.uk), built with Astro v6, Tailwind CSS v4, and Sveltia CMS. Deployed on Cloudflare Pages.

## Tech Stack

- **Astro v6** — Static site generation with Content Layer API
- **Tailwind CSS v4** — Styling via Vite plugin
- **Sveltia CMS** — Git-based CMS at `/admin`
- **Cloudflare Pages** — Hosting and deployment

## Project Structure

```
src/
├── components/     PostCard, TagList, CategoryList, Header, Footer, SEO
├── content/
│   └── posts/      Blog posts (Markdown)
├── layouts/        BaseLayout, BlogPostLayout
├── pages/
│   ├── blog/       Blog listing + individual posts
│   ├── tags/       Tag index + filtered views
│   ├── categories/ Category index + filtered views
│   ├── about.astro
│   ├── index.astro
│   └── rss.xml.ts
└── styles/         global.css (Tailwind v4)
public/
├── admin/          Sveltia CMS (index.html + config.yml)
└── images/uploads/ Blog images
```

## Commands

| Command | Action |
|:--|:--|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server at `localhost:4321` |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview build locally |
| `npx wrangler pages deploy dist --project-name word` | Deploy to Cloudflare Pages |

## Content Management

Visit `/admin/` to open Sveltia CMS. Log in with a GitHub Personal Access Token:

1. Generate a token at https://github.com/settings/tokens/new
2. Give it the **repo** scope
3. Paste the token into the Sveltia CMS login screen

Changes are committed to the repo and auto-deployed via Cloudflare Pages.

## Content Schema

Posts are defined in `src/content.config.ts` with these frontmatter fields:

| Field | Type | Required | Default |
|:--|:--|:--|:--|
| `title` | string | Yes | — |
| `description` | string | Yes | — |
| `pubDate` | date | Yes | — |
| `updatedDate` | date | No | — |
| `heroImage` | string | No | — |
| `category` | string | No | `uncategorized` |
| `tags` | string[] | No | `[]` |
| `draft` | boolean | No | `false` |

## Bible Study App Integration

This blog is integrated with the **Berean Bible Study Web App**. 
Study sessions can be published directly to this blog from the chat interface.

- **Endpoint**: GitHub REST API (Content PUT)
- **Path**: `src/content/posts/study-YYYY-MM-DD-xxxx.md`
- **Automation**: Build and deployment are handled by Cloudflare Pages upon receipt of the new commit.

## Deployment

Cloudflare Pages is linked to the GitHub repo. Pushes to `main` trigger automatic builds. Build settings:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
