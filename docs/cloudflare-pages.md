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

Cloudflare already watches `YouthOpp/youthopp.github.io` main. No Deploy Hook is required. Use a GitHub App owned by the YouthOpp organization, rather than a personal access token.

### Organization-owned GitHub App setup

1. Open **YouthOpp organization > Settings > Developer settings > GitHub Apps > New GitHub App**. Complete GitHub's access confirmation yourself if prompted. Register an organization-owned app such as `YouthOpp Catalog Publisher`, with homepage `https://github.com/YouthOpp/data-pipeline`. Disable **Webhook > Active**; no callback URL, user authorization, or webhook subscription is needed. Select **Only on this account** for installation availability.
2. Under **Permissions > Repository permissions**, set **Contents: Read and write**. Metadata read access is implicit. Leave all other repository and organization permissions unset. This app can write repository contents, not just the pointer file; limiting installation is therefore essential.
3. Open the app's **Install App > YouthOpp > Install**. Choose **Only select repositories**, select only `YouthOpp/youthopp.github.io`, and confirm the installation. Do not install it on `data-pipeline` or all repositories.
4. In the app's **General** page, locate **App ID**. In **YouthOpp/data-pipeline > Settings > Secrets and variables > Actions > Variables > New repository variable**, save it as `WEBSITE_APP_ID`. Never include its value in code, screenshots, or logs. The pinned action still supports `app-id`; v3 prefers `client-id`. A future migration must change both the input and stored identifier together; do not put a Client ID in this App ID variable.
5. In the app's **General > Private keys > Generate a private key**, download the PEM securely. In **YouthOpp/data-pipeline > Settings > Secrets and variables > Actions > Secrets > New repository secret**, save the complete PEM, including its BEGIN/END lines and real newlines, as `WEBSITE_APP_PRIVATE_KEY`. Enter and submit credentials yourself. Keep the key out of code, logs, chat, artifacts, and screenshots.

After release publication and retention, the workflow uses [actions/create-github-app-token v3.2.0](https://github.com/actions/create-github-app-token/releases/tag/v3.2.0), pinned to [`bcd2ba49218906704ab6c1aa796996da409d3eb1`](https://github.com/actions/create-github-app-token/commit/bcd2ba49218906704ab6c1aa796996da409d3eb1) (verified 2026-10-07). It explicitly requests `owner: YouthOpp`, `repositories: youthopp.github.io`, and `permission-contents: write`. Only the notification step receives the generated token as `WEBSITE_REPO_TOKEN`. Installation tokens expire after one hour and the action revokes the token at job completion by default; do not enable `skip-token-revoke`. The old personal-token secret is no longer referenced. Remove/revoke any obsolete personal token after checking whether another integration uses it.

Keep branch protections and rulesets enabled. If a rule blocks the app's main-branch commit, inspect the rejection and resolve it through the repository's reviewed policy; do not force push or disable protections.

### Acceptance checks

After the reviewed workflow change is merged and both Actions entries are configured, open **YouthOpp/data-pipeline > Actions > Collect and publish catalog > Run workflow**, select **main**, and run it. Do not rerun an old workflow revision as proof of the new token flow.

Verify the run succeeds through **Create website installation token** and **Update website catalog version**. Then inspect **YouthOpp/youthopp.github.io > Code > main > catalog-release.json > History**: the app's commit must reference that run's immutable release and the pointer's manifest SHA256 must match the released manifest bytes. The existing notification tests cover identical-content no-op, SHA-based updates, invalid manifests, and rejected writes; repeating notification with the exact same manifest must not create another commit. Rerunning the whole pipeline creates a new attempt/release tag and is not the identical-manifest test.

Finally open **Cloudflare dashboard > Workers & Pages > youthopps > Deployments**. Verify a successful **Production** deployment for that exact website commit on **main**, inspect the build log for the pinned catalog download/build, and check the production site. A green pipeline run or a website commit alone does not prove deployment success. Record run URL, release tag, website commit SHA, deployment URL/status and production check only after each is observed. Missing app setup, rejected notification, pending/failed Cloudflare deployment, and unavailable dashboard access remain unverified outcomes.

After successful immutable release and latest manifest publication, the pipeline commits a small `catalog-release.json` pointer to website main. It contains the pipeline repository, immutable release tag and manifest SHA256. Cloudflare's existing Git integration rebuilds that commit. Source data remains in pipeline Releases; the site repository stores only the version pointer.

The site downloader reads the pointer, downloads that release's manifest, checks its digest, and verifies catalog and contributor assets. Each website commit therefore builds the specified snapshot even if a newer release appears during the build. Before the first pointer exists, the downloader uses catalog-latest to bootstrap the site.

Failed collection or publication cannot update the website pointer. A missing token or rejected commit fails the notification step while preserving published data; restore access and retry notification. Repeating notification with the same manifest performs no additional commit. A successful commit means a Cloudflare build was requested; check deployment completion in Cloudflare Pages separately.
