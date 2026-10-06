# Cloudflare Pages deployment

Source: `YouthOpp/youthopp.github.io`, production branch `main`. Canonical domain: https://youthopps.org.

The static Node renderer replaces the former Jekyll build. In the existing Cloudflare Pages project `youthopps`, change the build settings before deploying this migration:

- Build command: `node scripts/download-catalog.mjs && REQUIRE_CATALOG=1 npm run build`
- Output directory: `dist`
- Root directory: repository root
- Node version: `22` or newer
- Build environment prerequisites: GitHub CLI (`gh`) and a GitHub token in `GH_TOKEN` for the current release downloader; verify their availability before changing the production build
- Custom domains: `youthopps.org` and `www.youthopps.org`

Publish the original YouthOpp/data-pipeline catalog release first. The downloader verifies the catalog and contributor assets from one immutable release. Production builds fail if required data is missing. No source collection runs in the frontend.

Cloudflare owns DNS targets and TLS for domains attached through Pages > Custom domains. Preserve existing Google, Bing, GitHub verification and DMARC DNS records. The root CNAME records the intended canonical domain for GitHub Pages; it does not configure Cloudflare DNS.

The build copies `_headers` into `dist` for Cloudflare security headers, generates `404.html`, robots.txt and sitemap.xml, and shares canonical/SEO configuration across pages. GA4 uses the centrally configured G-MGW77TH5Z3 identity and sends category/country events only after visitor consent. Submit https://youthopps.org/sitemap.xml after production acceptance.

The repository also contains a GitHub Pages Actions deployment. If Cloudflare serves the production domain, do not configure a competing domain binding in GitHub Pages. Check the Cloudflare build settings and production output separately from a successful GitHub Actions build.

PR #1 supplied the original Cloudflare configuration and accessibility intent; this migration adapts them to the active catalog renderer rather than restoring obsolete Jekyll sample pages.
