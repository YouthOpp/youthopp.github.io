# Data pipeline operations

The [data-pipeline repository](https://github.com/YouthOpps/data-pipeline) contains one scheduled and manually dispatchable `fetch-<source-id>.yml` workflow per configured source. Source workflows are staggered and serialized for safe updates to the shared catalog.

Each run collects one source, validates its records, and writes formatted JSON to `YouthOpps/data-source`: `sources/<source-id>/metadata.json`, `sources/<source-id>/opportunities.json`, and the unified `catalog.json`. If data is unchanged, no commit is needed. Failed and empty collections do not replace valid snapshots.

The [website repository](https://github.com/YouthOpps/youthopps.github.io) tracks `data-source` as a Git submodule. Its `check new data` workflow checks for a newer source commit hourly and commits the changed submodule reference to website `main`. Cloudflare Pages deploys on website commits. The pipeline does not notify the website or manage deployments.

## Verification and recovery

Check individual `fetch-*` runs in GitHub Actions for extraction, validation, and commits. Inspect `data-source/catalog.json` for valid pretty-printed JSON. Check the website's hourly `check new data` run and its submodule cursor, then confirm Cloudflare deployment and the rendered catalog. Retry failed source collections manually after correcting the cause. Revert the website submodule pointer to a known good data-source commit if rollback is necessary.
