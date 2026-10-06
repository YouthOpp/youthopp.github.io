# Website settings and operations

## Central settings and shared templates

The production address is https://youthopps.org. Edit `site.config.json` for the canonical URL, title, description, brand caption, tagline, mission, original repository link, logo/social artwork paths, navigation and footer links. The shared page template in `scripts/build.mjs` renders the header, footer, metadata and structured data for every route. Catalog rows and pagination also use shared renderers. Do not copy headers, footers or verification tags into individual pages.

Production Actions uses the checked-in configuration. An old repository variable `SITE_URL` no longer overrides it. A `SITE_URL` environment override remains available for deliberate local preview builds; it does not configure DNS or GitHub Pages. Project repository identities remain the original YouthOpp URLs; production download and deploy configuration uses those same original YouthOpp repositories.

## Domain and deployment

In `YouthOpp/youthopp.github.io` Settings → Pages, choose **GitHub Actions** as the Source and enter `youthopps.org` as the Custom domain. Configure the domain's DNS for GitHub Pages. Then set apex A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153` and `185.199.111.153`. If using www, set its CNAME to `YouthOpp.github.io` without a repository path. Wait for the DNS check and certificate, then enable Enforce HTTPS. See the [GitHub custom-domain guide](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site). The root `CNAME` records the intended domain. A custom Actions deployment ignores this file for domain binding; the Pages Custom domain setting is still required. This site uses `site.config.json` and the shared JavaScript renderer, not Jekyll `_config.yml` or `_layouts/default.html`. Confirm the public URL and ensure a subsequent main push does not launch a competing Jekyll publisher before closing hosted QA.

Run `npm test` and `npm run build` with Node.js 22. Set `CATALOG_PATH` to the published JSON catalog; output is `dist/`. Contributor data defaults to `contributors.json` beside `CATALOG_PATH`, or set `CONTRIBUTORS_PATH` explicitly. Production uses `REQUIRE_CATALOG=1` to reject missing catalog, registry or contributor data. Never publish test fixtures.

The workflow reads the `catalog-latest` manifest from the original `YouthOpp/data-pipeline` repository, retrieves catalog and contributor assets from the same immutable release, and verifies digests and byte sizes. Production Actions pins `YouthOpp/data-pipeline`; a stale `DATA_REPOSITORY` repository variable cannot redirect production to a development fork. The downloader accepts an explicit repository override for tests/local development only. Production deploys only `YouthOpp/youthopp.github.io` main. Pull requests run tests and an empty-state documentation build.

## Analytics: the exact field

Create a Google Analytics 4 web data stream for https://youthopps.org. In `site.config.json`, set `googleAnalyticsId` to its Measurement ID, for example `G-XXXXXXXXXX`. The configured production Measurement ID is `G-MGW77TH5Z3`. Enter only the ID, not a script snippet or API secret. Leave it empty to disable analytics. The shared template includes `assets/analytics.js` only for a valid ID. That script loads Google tracking only after the visitor selects Allow analytics; Decline keeps tracking off. Update `docs/privacy.md` to reflect the actual analytics account, purpose and contact before enabling it. Do not paste analytics into individual pages.

## SEO: the exact fields and owner actions

- `url`: https://youthopps.org; used by canonical URLs, structured data, social URLs, robots.txt, sitemap.xml and llms.txt.
- `title` and `description`: English site name and concise mission/search description. Individual pages receive their own titles and descriptions from the shared renderer and validated pipeline records.
- `googleVerification`: optional Google Search Console HTML meta-tag content token, not the whole tag. This verifies a URL-prefix property. A Domain property instead requires a DNS TXT record; that token belongs in DNS.
- `bingVerification`: optional Bing Webmaster Tools meta-tag content token, not the whole tag.
- `socialImagePath` and `logoPath`: checked-in artwork paths; replace the corresponding asset files when updating visuals. Social-image alt text derives from the central title and tagline.

After the domain works publicly, verify Search Console and Bing and submit https://youthopps.org/sitemap.xml. Sitemap, robots, canonical tags, Open Graph, Twitter cards and Organization/WebSite/breadcrumb structured data are generated automatically. No keyword list or repeated tracking/SEO snippet is needed. Metadata and registration do not guarantee ranking. Keep original publisher attribution and unknown eligibility/application status accurate.

## Static scalability

Build-time category and destination pagination limits list pages to the configured `pageSize` (30 by default). Links work without JavaScript; no complete catalog is downloaded into every browser. Unknown status does not establish that applications remain open.

## Catalog analytics events

All generated categories and destination countries use the same consent-gated event handler. Category and country IDs are derived from the validated catalog at build time, rather than copied into page-specific scripts. The collector owns taxonomy and destination metadata; the website supplies only the rendered event context.

| Event | Trigger | Parameters |
| --- | --- | --- |
| catalog_view | A category, country or combined catalog page loads after consent, including pagination | category, country, page_number |
| category_select | An internal category/all-categories link is selected | destination category, country, page_number |
| country_select | A country or combined category/country link is selected | destination category, country, page_number |
| country_filter | The country selector changes | current category/page_number and selected country |

`all` means no category/country restriction; `unknown` means destination was not provided. Parameters contain validated identifiers only; custom events never send typed search queries, arbitrary links or personal data. Events before consent are discarded, not replayed. GA4's standard page view remains separate from `catalog_view`; count the relevant event rather than adding the two as page views.

In GA4 Admin → Custom definitions, add event-scoped dimensions `category` and `country` to build comparison reports; `page_number` can be an event-scoped custom metric. Check `catalog_view`, `category_select`, `country_select` and `country_filter` in Realtime after a consented visit. Repository changes do not create these account-side reporting definitions.
