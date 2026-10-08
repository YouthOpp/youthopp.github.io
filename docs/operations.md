# YouthOpps operations

## Repository responsibilities

- **data-pipeline**: source registry, adapters, tests, and one `fetch-<source-id>` GitHub Action per source. Each source can run on schedule or manually.
- **data-source**: stores source JSON records and the unified `catalog.json`; contains no GitHub Actions.
- **youthopps.github.io**: builds the static site from the pinned `data-source` Git submodule. `check new data` checks for source changes hourly, updates the Git submodule pointer, and commits to website main only when it changed.

All generated JSON files should use two-space indentation with a trailing newline. Collection failure must preserve previously valid data. A broken website build must not be presented as a successful deployment.

## Publication

Successful source collection commits validated records and the catalog to data-source. The website checks data-source once per hour; when it detects a new source commit, it creates a website commit to update the pinned submodule SHA. Cloudflare Pages automatically builds website main. No Deploy Hook, release pointer, pipeline-to-website notification, or website write permission in pipeline is necessary.

## Quality

Before merging website changes, run `npm test` and `npm run build`; for production set `REQUIRE_CATALOG=1` and initialize submodules. Before merging pipeline changes, run `npm ci --ignore-scripts`, `npm run validate`, and `npm test`. Verify source provenance, published countries, user-facing content, and the Cloudflare deployment separately. Use GitHub Issues for reproducible incidents and Discussions for proposals. Private email: contact@youthopps.org.
