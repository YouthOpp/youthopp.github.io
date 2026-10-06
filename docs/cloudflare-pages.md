# Cloudflare Pages deployment

Source: `YouthOpp/youthopp.github.io`, production branch `main`.

- Build command: `bundle exec jekyll build`
- Output directory: `_site`
- Root directory: repository root
- Environment variable: `JEKYLL_ENV=production` (also set for preview builds)
- Custom domains: `youthopps.org` and `www.youthopps.org`

Cloudflare builds new commits automatically. Pull requests receive preview deployments; merge the PR to release the updated design on the production domain.

Do not add a GitHub Pages CNAME file for Cloudflare hosting. Attach each hostname through Pages > Custom domains; Cloudflare manages the DNS target and HTTPS certificates.

Keep the Google TXT, GitHub domain verification TXT and Bing CNAME records in Cloudflare DNS. DNS ownership verification does not require HTML verification tags.

Analytics uses `G-MGW77TH5Z3` in production. `jekyll-sitemap` generates `/sitemap.xml`; after deployment submit `https://youthopps.org/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

The opportunities currently in the repository are sample entries with placeholder application links. Replace them with verified opportunities before presenting them as live listings.

Reference: https://developers.cloudflare.com/pages/framework-guides/deploy-a-jekyll-site/
