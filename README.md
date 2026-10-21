# Spursbase Foundation website

## Run the site

Copy `.env.example` to `.env.local`, set the required site and Sanity values, and set `ADMIN_API_TOKEN` to a long, private publishing secret. Then run:

```sh
npm run dev
```

The Express server serves the Next.js application and the private publishing endpoint. Visit `/admin.html` (or `/admin`) to create a post; the live feed is at `/blog`.

## Local post storage

Authorized posts are validated, sanitized, and appended to `data/posts.json`. New posts appear on the feed and at `/blog/<title>-<year>`. This file-based store requires a single server with a persistent writable filesystem; serverless or ephemeral deployments need a persistent database or mounted volume instead. Back up `data/posts.json` with the site's content backups.

Never commit a real admin token or `.env.local`. Keep the publishing token private and transmit it only over HTTPS.
