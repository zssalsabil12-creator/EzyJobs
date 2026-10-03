# EzyJobs production publishing

## Current architecture
EzyJobs is a Vite static frontend with Supabase for application data/authentication. The build pipeline generates the production bundle in `dist`, then prerenders the site's indexable routes.

## Production build
Run:

```
npm ci
npm run release-check
```

The release check runs the type check, production build/prerender, and the smoke suite.

## Hosting
The project is prepared for Vercel. Vite's current deployment guidance supports importing a Vite project into Vercel; Vercel detects the framework and uses the generated `dist` output. See:
https://vite.dev/guide/static-deploy
https://vercel.com/

## Environment variables
Set these production variables in the hosting provider:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not upload the local `.env` file. It is ignored by Git.

## Domain and SEO
Before the final production deployment:

1. Confirm the production domain.
2. Confirm the canonical URL in the generated HTML/SEO configuration.
3. Submit the generated `/sitemap.xml` to the search engine webmaster tools.
4. Verify `/robots.txt`.
5. Confirm the production Supabase URL and publishable key are from the intended project.
6. Test authentication, search, saved jobs, applications, admin access and all public routes on the production URL.

## Release sequence

```
git push
→ Vercel Preview
→ QA the preview
→ Production deployment
→ attach custom domain
→ production smoke test
```

The current Vite build is designed as a static deployment; the generated `dist` directory is the deployable artifact.
