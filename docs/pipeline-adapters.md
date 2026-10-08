# Community adapter guide

Open AI agent: adapter implementation and contribution decisions are documented openly.

## Shared RSS adapter

Add a manifest to `data/sources/sources.json` with unique lowercase `source`, HTTPS `source_url`, publisher `website_url`, boolean `enabled`, `adapter: "rss"`, original `language`, `default_tags`, `added_at` and `scope`. An enabled flag requests collection; it does not prove successful collection, an open application or a reuse licence. Record the verification date, latest entry date, response status, terms/access observations and evidence in the source research registry.

## Custom adapters

Implement an exported async `collect({manifest, fetchText, now})` function returning normalized opportunity records. Add a named adapter to an explicit trusted dispatch table in `scripts/collect.js` and extend manifest validation. Arbitrary paths or remote executable modules in manifests are prohibited. An empty result must throw instead of erasing previous state. Add sanitized publisher fixtures and tests for extraction, links, dates, missing eligibility and outage behavior. Do not include complete copyrighted articles in fixtures.

## Required output

Return stable id, title, original url, source slug, source_url feed/API endpoint, published_at, summary as an empty string (no publisher descriptions or article prose), tags, location, deadline, language, category, host_countries, eligible_countries, created_at, updated_at, first_seen_at, last_seen_at, last_checked_at and status. Country arrays use ISO two-letter codes and stay empty when unknown. Never infer applicant citizenship from publisher country. Avoid inferred deadlines from titles. Sources may be in any language; site navigation is English.

Pipeline handles merge, preservation and publication. Run `npm run validate && npm test`; supply live source evidence in the PR. Contributors can learn AI-assisted engineering and build a visible portfolio. Contributions cannot guarantee scholarships, employment or internships.

## Quality and provenance

Reference original publisher and opportunity URL in every record. Publisher identity is not a blanket quality endorsement. Report collection failures transparently. Source additions are reviewed for relevance, recent activity, reliable URLs and respectful collection frequency. Never bypass access controls or scrape blocked feeds. Respect explicit access blocks and report unverified or failed collection honestly.

Machine-readable opportunity shape is published in `schemas/opportunity.schema.json`; the runtime validator adds URL, timestamp and duplicate checks. Host restrictions reject private literal addresses and redirecting endpoints. They are defensive checks for reviewed public manifests, not a full DNS-rebinding firewall; trusted maintainers must review hostnames before enabling feeds.

## Reviewed programme metadata

The trusted `reviewed-rss` adapter selects only exact URLs listed in `reviewed_items`, with reviewed category and `programme-overview` or `institutional-grant` kind. It publishes the original title, link and publication date, leaves summary empty, and preserves unknown availability, deadline and country eligibility. Publisher news/alumni items outside the list are ignored. An exhausted selection fails explicitly and preserves prior records; maintainers must review new programme URLs before adding them. Publicly advertised RSS and robots access were checked for the Czech source; metadata-policy review is not an express reuse licence or publisher endorsement. NL/PT feeds remain disabled because their observed items did not provide selected opportunity calls.

The trusted `reviewed-html` adapter collects one exact `reviewed_page` URL. It requires a matching canonical link and exactly one matching JSON-LD `WebPage`; a missing, changed or ambiguous programme identity fails and preserves previous records. Only the page name, original link and `datePublished` are indexed. `dateModified` never replaces the original publication date. Summary, deadline and country eligibility stay unknown; `programme-overview` distinguishes the programme from an individual open application call. The NASA source is reviewed for factual, non-endorsing metadata use with source acknowledgment and collects no images, logos, article prose or third-party material. Collection uses the existing bounded HTTPS fetch and six-hour schedule. See [dated access review](/docs/access-review-2026-10-05/) for primary policy links and limitations.

For the exact Portugal master's programme and Netherlands doctoral programme, `reviewed_page.metadata_format: "open-graph"` requires one matching canonical and exactly one matching `og:url`/nonempty `og:title`. It indexes only the factual original title/link. `article:published_time` is used only when explicitly present and valid; a missing original date remains null. `article:modified_time` is never publication. The Netherlands metadata selection also has no original publication timestamp and honors the observed ten-second same-host crawl delay; one page is fetched per six-hour run. The NASA JSON-LD path still requires its explicit original publication timestamp. Both records stay programme overviews with unknown application state and empty prose, rather than an individual open call. See the dated access review for the scoped project assessment, all-rights-reserved footer and absence of express reuse permission.


## Exact title/link integrations and source switches

Every researched publisher has a manifest in `data/sources/sources.json`. The `enabled` field is the collection switch. The current registry contains 110 definitions, of which 84 are enabled and have a matching `fetch-<source-id>.yml` GitHub Action. The other 26 are disabled and have no scheduled fetch Action. Changing the source registry and its workflows must be coordinated. Source access restrictions, publisher permission, and validated metadata determine whether extraction can publish.

The `link-metadata` adapter reads only the selected research page's factual title and original URL. It produces `kind: unknown`, unknown application status, no deadline/date/eligibility claims and an empty description. A directory or programme landing page is not promoted to an open opportunity. This is one-page integration, not discovery of every listing or application within that publisher. Existing RSS adapters also omit publisher descriptions, and retained older descriptions are removed during collection.

Before each new-adapter page request, robots rules are evaluated for YouthOpp, with wildcard fallback and longest-match allow/disallow behavior. Missing robots (HTTP 404) differs from inaccessible robots: unavailable, denied or ambiguous access fails closed. Explicit `collection_blocked_reason` restrictions stop both probes and production before any request; simply setting `enabled: true` cannot bypass them. Current explicit restrictions cover IKY, Malta Student Grants, Fundación Carolina and la Caixa. These four definitions are configured enabled but operationally blocked before requests; this is not a claim that all 110 collect successfully. Pending policy review is not an express licence or a blanket ban on factual linking. Neither a successful probe nor robots permission constitutes publisher endorsement or a reuse licence.

Run `npm run probe -- --all` or `npm run probe -- --source be-study-in-flanders` to test title/link extraction locally without publishing catalog data. Probe results are diagnostic only and do not establish source permission or successful production ingestion; source collection publishes only through individual `fetch-*` workflows.


## Source removal requests

A publisher or other concerned person can request removal of a source or indexed link by opening an [issue](https://github.com/YouthOpp/data-pipeline/issues/new) or submitting a small [pull request](https://github.com/YouthOpp/data-pipeline/pulls). Include the source name/ID and affected URL; a brief reason helps identify the requested change. No identity documents or confidential information should be posted publicly. A request through either route is sufficient to start review; no special form is required.

To stop collection, change the matching `enabled` field to `false`. For removal from the current public directory as well, remove the corresponding manifest and research registry entry together; the next validated catalog and website publication will omit that source and its records. Historical releases and Git history are separate from the current index; specify them in the issue if they are also part of the request. YouthOpp publishes factual discovery metadata and links to original publishers, without claiming publisher endorsement or ownership of their content.

## Dated live verification — 6 October 2026

Historical source-probe experiments are not part of production publication. The current source manifest, adapter tests, and latest `fetch-*` run for an enabled source are the operational authority.