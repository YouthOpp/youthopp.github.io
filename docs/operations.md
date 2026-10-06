# Operations

## Collection and publication

Collection runs on pushes to the default branch, every six hours and manual dispatch for the `YouthOpp/data-pipeline` component, in that original repository. Website builds run on main-branch pushes, every six hours, manual dispatch and pull requests for the `YouthOpp/youthopp.github.io` component, in that original repository. Apply concurrency so overlapping publication cannot race. Validate adapter fixtures and the normalized catalog before publishing. Failed collection must retain prior healthy source state; failed site builds leave the last successful Pages deployment available.

Release assets hold durable normalized snapshots: `catalog-<run_id>-<run_attempt>` publishes `catalog.json`, `collection-report.json`, `contributors.json` and `manifest.json`, while `catalog-latest` holds the latest successful assets and manifest pointer. The collector restores its previous state from `catalog-latest`. The manifest records the immutable release tag, asset SHA-256 digests and byte sizes. Actions artifacts are short-lived diagnostics and must not be the only copy of usable data. The UI has no checked-in source or contributor dataset baseline; offline development consumes explicit pipeline outputs with their original timestamps. Keep raw samples small and useful for tests. Do not commit growing full article bodies or daily raw archives indefinitely.

Production website builds first capture `manifest.json` from `catalog-latest` for the `YouthOpp/data-pipeline` component, in that original repository, then retrieve `catalog.json` from its immutable `catalog-<run_id>-<run_attempt>` release and retrieve `contributors.json` from that same immutable release and verify both assets’ SHA-256 digests and byte sizes before building all routes against that one snapshot. The registry is read only from `catalog.source_registry`; missing production registry or contributor data fails the build. This uses the standard workflow token rather than a cross-repository personal access token. Missing or malformed manifests, download failures and integrity mismatches fail the build; production never silently falls back to unchecked data. Website and collector schedules are independent: a website build may consume the previous successful immutable release if collection has not finished yet. Production Actions pins `YouthOpp/data-pipeline`; explicit local/test downloader overrides do not change the production repository. The website never collects contributor history. PR builds skip release downloads, exercising deterministic tests and an honest empty state when no local catalog exists. Production requires a catalog; a failed download or build prevents deployment and leaves the prior Pages deployment available. Deployments target only `YouthOpp/youthopp.github.io` on main. Publish the pipeline catalog before the first production website build. Deployment and data publication have separate permissions.

## Site and documentation

Generate category, host-country, source and opportunity routes. Use 30-record pages and ordinary navigation. Docs cover mission, architecture, adapter contract, source research, operations, contributor scoring, privacy and contribution workflow. English navigation and explanations coexist with original-language opportunity excerpts.

## Owner configuration

Google and Bing verification identifiers and analytics configuration are optional. Empty identifiers produce no placeholder verification metadata or tracking requests. Account verification and search-console submission are owner tasks. Configured analytics requires an accurate privacy statement and applicable consent behavior. No personal information is required to browse opportunities.

## Health

Record collection attempt time, last success, source error class and record count independently. A website generation timestamp cannot substitute for per-source health. Surface stale sources and unknown deadlines. Keep error logs free of credentials and full source article bodies.

## Reproduction and rollback

Document exact install, fixture test, collection and website build commands in each repository README. Dependency locks make builds reproducible. A prior dataset version and prior website code revision enable rollback; never overwrite history to disguise errors. The pipeline automatically retains the newest 30 published versioned catalog releases plus the current run and latest pointer; unrelated releases, drafts and prereleases are excluded. See [Catalog operations](/docs/pipeline-operations/) for verification and rollback details.

## Implementation status

This document defines the intended architecture. Feature status must be established by the checked-in workflows and passing integration tests; planned release publication, health metadata or analytics consent must not be described as completed if implementation differs.

## Verified production baseline — 5 October 2026

The producer run 37270813364 passed 41 tests, prior-state recovery, collection, immutable/latest publication and retention. Release catalog-37270813364-1, published at 06:07:29 UTC, contains 36 retained records from six healthy integrations. The current collection returned 34 records; two earlier Opportunities for Youth records were retained. These are source-health and indexed-record counts, not counts of open applications.

| Integration | Retained records |
|---|---:|
| Opportunities for Youth | 12 |
| Opportunity Desk | 10 |
| Scholarships Corner | 10 |
| Czech Fulbright programme metadata | 2 |
| NASA programme metadata | 1 |
| Portugal Fulbright programme metadata | 1 |

The catalog asset is 320,360 bytes with SHA-256 `8e3c9d2e689513eaa8b28ccaf25f596443a19eb3d61625fcfdc4ee895d8460ad`. The catalog, collection report and manifest were independently checked against the immutable release. The research register contains 110 entries; the runtime registry contains 111, including the unmatched Opportunities for Youth runtime source. Six working integrations measure automated collection separately from the target of three to five active researched publishers per USA/EU country. The [dated source register](/docs/source-research/) records editorial activity, verified-open coverage gaps and operational adapters as distinct measures; a closed annual call can establish publisher activity without establishing a currently open application.

The Portugal record, “Bolsa Fulbright para Mestrado,” indexes the original programme title and link only. It is a scholarship programme overview with empty prose and unknown application availability, deadline, destination and eligible countries. Original publication is absent and stays null; the observed modification date is not publication. `PT` identifies the publisher, not applicant eligibility or programme destination. Czech and NASA programme/institutional records also remain information listings rather than inferred open youth calls. See [the scoped access review](/docs/access-review-2026-10-05/) for acquisition limits; Portugal RSS and permission-required IKY ingestion remain disabled.

Actual scheduled operation is separately evidenced by the successful producer schedule run 37269037131 and website schedule run 37269677990. Their creation times were 05:43:24 and 05:52:10 UTC respectively. A configured cron alone is not this evidence.

The subsequent website run 37270828588 passed build and Pages deployment, but captured the previous 35-record `catalog-37270179595-1` snapshot while the new producer release was still publishing. That deployment does not establish consumption of the 36-record release.

The later website run 37271362237, created at 06:13:47 UTC for main `e90672f9da9f6c2dca9cc1083c00384abb1a0a0c`, passed all 17 tests. Build job `111638865996` explicitly verified 320,360 catalog bytes from immutable `catalog-37270813364-1` and generated 36 records. Deploy job `111638943982` reported success at 06:14:17 UTC using artifact `11328398453`. This verifies exact-release consumption and deployment; it does not establish current public or private hosted functional acceptance. Independently check hosted catalog and source-health pages when the required access and routing are available.

Public Pages acceptance remains unresolved: the operational project URL inherits an owner-controlled custom-domain redirect. Independent direct probes at 06:19:56–06:20:04 UTC on 5 October 2026 reproduced HTTP 301 followed by HTTP 404; restricted-network 403 probes were inconclusive. Resolving owner-controlled routing is separate from a successful deploy. The owner-private test deployment supports review but does not establish public availability. Optional search verification and analytics remain disabled without owner-controlled identifiers.

## Netherlands producer stage — 5 October 2026

The later producer run 37272654737 completed successfully from main `17b997da390ebef8c0be07064984d4315471e4c3`. Its collection job `111642769632` passed all 44 tests, validated seven integrations and reported 37 retained records with all seven sources healthy. The immutable release catalog-37272654737-1 was published at 06:29:36 UTC. Its catalog asset is 324,910 bytes with SHA-256 `8c93f5d91fb41e2c0eeb4bcd12f7ec2afd70240b4db457388040b30c260e9616`.

The added Netherlands record retains only the original doctoral programme title and canonical link. It is a programme overview with empty source prose and unknown publication, application availability, deadline, destination and eligible countries. `NL` identifies publisher geography. General Netherlands RSS remains excluded for relevance; one exact page is a distinct, bounded acquisition path with ten-second same-host spacing.

This producer stage does not establish website consumption of the 37-record release or hosted functional acceptance. The next main website build must log this immutable release or a newer integrity-checked release; deployed catalog and source-health pages need separate acceptance. The earlier 36-record producer/consumer evidence remains a dated historical baseline.

Repository names in these documents identify the original YouthOpp project. Dated run IDs and release tags above are evidence from authorised operational copies, not claims that those runs occurred in the original repositories. Current production deployment and acquisition settings now target the originals; the preceding fork run IDs remain historical verification evidence.

## Intended public domain (2026-10-06)

The owner selected https://youthopps.org. Current shared templates and discovery metadata derive from `site.config.json`. Earlier run/deployment evidence remains dated evidence, not acceptance of this new endpoint. GitHub Pages must use GitHub Actions with the custom domain configured separately, followed by DNS/HTTPS and actual public HTTP/browser checks. Hosted QA remains open until public acceptance and no competing publisher on a subsequent main push. See [Website settings](/docs/site-settings/) for configuration.

## Original production migration — 2026-10-06

The owner selected the original YouthOpp organization for production. Merge the pipeline PR first, publish and verify its immutable original-repository release, then merge the website PR. Configure GitHub Pages in `YouthOpp/youthopp.github.io` with Source GitHub Actions and Custom domain youthopps.org; configure DNS and verify HTTPS/public routes. Previous fork deployments do not establish acceptance of this original-repository deployment. Pipeline technical documents are authoritative in website `docs/` and rendered at https://youthopps.org/docs/.
