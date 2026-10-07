# Adapter and catalog contract

## Dataset

Version 1 catalog JSON has `schema_version`, `generated_at`, `opportunities` and `sources`. Generation time describes the dataset build, not the freshness of every record. Consumers reject unsupported schema versions and malformed records before publication.

## Opportunity fields

| Field | Meaning |
| --- | --- |
| id | Stable source record identity |
| title | Original title, escaped when rendered |
| url | Original opportunity article or publisher detail page |
| source | Registry slug |
| source_url | Retrieval endpoint such as the RSS feed |
| summary | Plain-text excerpt, at most 600 characters |
| language | Source language; do not silently translate |
| category | scholarships, internships, volunteering, fellowships, training, jobs, competitions, grants or other |
| tags | Original or explicitly mapped labels |
| host_countries | ISO country codes where opportunity occurs; empty means unknown |
| eligible_countries | Explicit eligible applicant countries; empty means unknown |
| deadline | ISO date/time or null; null never means open indefinitely |
| published_at | Publisher publication time or null |
| first_seen_at / created_at | First successful observation |
| last_seen_at | Most recent successful observation of this record |
| last_checked_at | Successful source retrieval time, not a failed attempt time |
| updated_at | Actual content update time |
| status | open, expired or unknown; avoid unsupported certainty |
| location | Original location text or null |

Publisher location must never be used as applicant eligibility. Preserve provenance when grouping duplicate opportunities; conservative URL identity is preferable to merging unrelated titles. HTTP and HTTPS links only; reject credentials, script protocols and invalid URLs.

## Source registry

Each source has a safe slug, name, homepage, retrieval endpoint, adapter type, language, publisher country, enabled status and documentation. Research records include added/checked dates, types of content, evidence of recent activity, retrieval method and limitations. Directory candidates are distinct from tested live adapters. Do not mark sources active simply because the homepage exists.

## Adapter responsibilities

See the [Community adapter implementation guide](/docs/pipeline-adapters/) for manifest fields, trusted dispatch, commands and reviewed programme selection.

A common RSS/Atom adapter handles configuration-only sources. A custom adapter transforms fetched source content into normalized candidates. The pipeline owns stable IDs, timestamps, common validation, persistence and publication. Fixture tests exercise typical and malformed content without hitting live services. Implementation function names must match the actual exported API; this contract describes responsibilities rather than requiring a specific signature.

Collection uses bounded response sizes, timeouts, restricted public endpoints and polite request frequency. Retry transient errors with a bounded budget. Source errors are isolated. Never overwrite good state with empty data caused by parse/network failures; successful empty responses require an explicit documented policy. Missing an item from a feed is not proof that the opportunity expired.

## Freshness acceptance

A failed fetch must not parse old `latest.xml` as current data or reset first-seen dates. Retained records keep observation timestamps and gain source failure/stale context. Tests must show that failed collection cannot falsely refresh cards. Existing historical records with unreliable timestamps should carry that limitation rather than fabricated verification dates.
