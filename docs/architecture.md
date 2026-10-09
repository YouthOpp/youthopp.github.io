# How it works

Three projects move information from publishers to a static website. A separate AI workspace guides development.

```flow
caption: From a publisher to a reader
Publisher | Original opportunity information
data-pipeline | Collect and validate one source
data-source | Store that source's JSON snapshot
youthopps.org | Build pages and search indexes
Cloudflare Pages | Serve the website to readers
```

## What lives where

| Repository | Responsibility | Main files |
| --- | --- | --- |
| [data-pipeline](https://github.com/YouthOpps/data-pipeline) | Retrieve, validate and publish each source | `adapters/<source>/adapter.py`, `test_adapter.py`, one Action per adapter |
| [data-source](https://github.com/YouthOpps/data-source) | Store published data; no collection code or Actions | `datas/<source>/data.json` and `metadata.json` |
| [youthopps.org](https://github.com/YouthOpps/youthopps.github.io) | Present data, source information and these guides | `scripts/`, `assets/`, `docs/`, `site.config.json` |
| [ai-workspace](https://github.com/YouthOpps/ai-workspace) | Coordinate development; not a fourth runtime service | `AGENTS.md`, `docs/WORKFLOW.md`, `skills/`, repository submodules |

## One source, two files

`data.json` holds the last successfully validated records. `metadata.json` identifies the source and reports status, explanation, attempt/success times, errors and available publisher information.

| Collection outcome | Published result |
| --- | --- |
| Success | Replace that source's records and record `success` with a new success time |
| Failure after a success | Keep last-good records and success time; record `fail` and a sanitized explanation |
| First attempt fails | Do not create an empty published source |

Only authorized pipeline publication writes data-source; exceptional manual recovery belongs to administrators. Website development never edits published data.

If publication or durable error reporting fails, the run fails explicitly; it must not claim a successful update. Previously published data remains available.

## Automation

Each source Action runs only its own adapter with `--publish`. The configured OeAD, FEBA and Fulbright Germany Actions run every six hours; Opportunity Desk and NASA run manually. Live adapter tests do not publish and are not run by Actions.

```flow
caption: Refreshing youthopps.org is separate from source collection
Every hour | youthopps.org checks data-source main
Changed revision | Commit the new data submodule pointer
Cloudflare Git build | Validate data and generate dist/
Readers | Receive the successful deployment
```

If the data revision is unchanged, no refresh commit is made. Scheduled jobs can run late. A commit or passing local build is not proof of a live deployment. The workspace's own hourly pin refresh is development housekeeping, not website publication.

## What youthopps.org builds

Every build reads one selected `datas/` snapshot, validates it, and creates static pages and collection search indexes in `dist/`. Missing or malformed required input fails. No upstream aggregate catalog or application server is needed.

Search and combined filters cover the whole selected collection before pagination. Publisher country, destination and applicant eligibility are separate. Unexpired dated records sort by nearest deadline first, followed by unknown deadlines, then expired records in deadline order. Equal deadlines use record IDs for stable ties. Build output and browser search use the same ordering before pagination; the homepage preview also refreshes from the full collection. Expiry and ordering refresh on load, every 30 seconds and when returning to the tab. Expired records remain visible and turn grey through browser JavaScript. Date-only deadlines end at midnight after that UTC day. Static browsing works without JavaScript; search and live expiry need it.

## Delivery

Cloudflare Pages uses Node.js 22, `npm run build`, output `dist`, and the website's `main` branch. `npm run check` runs tests, build and output verification; the website check Action runs it on PRs and main.

The selected data-source revision must contain `datas/`. The local migrated data can be checked with `DATA_PATH`, but it must be published and pinned before production rollout. Live Cloudflare deployment has not been verified here.
