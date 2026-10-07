# Cloudflare Pages deployment

Source: `YouthOpp/youthopp.github.io`, production branch `main`. Canonical domain: https://youthopps.org.

The static Node renderer replaces the former Jekyll build. In the existing Cloudflare Pages project `youthopps`, change the build settings before deploying this migration:

- Build command: `node scripts/download-catalog.mjs && REQUIRE_CATALOG=1 npm run build`
- Output directory: `dist`
- Root directory: repository root
- Node version: `22` or newer
- No GitHub CLI or GitHub token is needed in the Cloudflare build; public release assets are downloaded over HTTPS
- Custom domains: `youthopps.org` and `www.youthopps.org`

Publish the original YouthOpp/data-pipeline catalog release first. The downloader verifies the catalog and contributor assets from one immutable release. Production builds fail if required data is missing. No source collection runs in the frontend.

Cloudflare owns DNS targets and TLS for domains attached through Pages > Custom domains. Preserve existing Google, Bing, GitHub verification and DMARC DNS records. The root CNAME records the intended canonical domain for GitHub Pages; it does not configure Cloudflare DNS.

The build copies `_headers` into `dist` for Cloudflare security headers, generates `404.html`, robots.txt and sitemap.xml, and shares canonical/SEO configuration across pages. GA4 uses the centrally configured G-MGW77TH5Z3 identity and sends category/country events only after visitor consent. Submit https://youthopps.org/sitemap.xml after production acceptance.

GitHub Actions validates the site and stores a build artifact; it does not deploy to GitHub Pages. Cloudflare Pages is the production publisher. Check the Cloudflare build settings and production output separately from a successful GitHub Actions validation.

PR #1 supplied the original Cloudflare configuration and accessibility intent; this migration adapts them to the active catalog renderer rather than restoring obsolete Jekyll sample pages.


## Automatic data refresh

Cloudflare already watches `YouthOpp/youthopp.github.io` main. No Deploy Hook is required. Add the GitHub Actions repository secret `WEBSITE_REPO_TOKEN` in `YouthOpp/data-pipeline`: use a fine-grained token with Contents read/write access only to `YouthOpp/youthopp.github.io`. Keep the token out of code and logs.

After successful immutable release and latest manifest publication, the pipeline commits a small `catalog-release.json` pointer to website main. It contains the pipeline repository, immutable release tag and manifest SHA256. Cloudflare's existing Git integration rebuilds that commit. Source data remains in pipeline Releases; the site repository stores only the version pointer.

The site downloader reads the pointer, downloads that release's manifest, checks its digest, and verifies catalog and contributor assets. Each website commit therefore builds the specified snapshot even if a newer release appears during the build. Before the first pointer exists, the downloader uses catalog-latest to bootstrap the site.

Failed collection or publication cannot update the website pointer. A missing token or rejected commit fails the notification step while preserving published data; restore access and retry notification. Repeating notification with the same manifest performs no additional commit. A successful commit means a Cloudflare build was requested; check deployment completion in Cloudflare Pages separately.
