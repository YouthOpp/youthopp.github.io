# Data quality and freshness

YouthOpp is a discovery index, not the authoritative application service. Always confirm current eligibility, deadlines and application instructions with the original publisher. A successfully downloaded feed is not certification of its opportunities.

## What the RSS adapter currently knows

The implemented RSS adapter retains the item title, original URL, feed URL, publication date when parseable, a plain-text excerpt of up to 600 characters and source tags. Language comes from the reviewed source manifest. Categories are derived conservatively from feed tags; unmatched records remain `other`.

The RSS adapter currently leaves deadline, location, destination countries and eligible countries unknown. It does not extract or guess these from titles. Therefore missing country catalogs or unknown deadlines reflect real metadata gaps rather than universal eligibility. Training, competition and grant categories may require richer reviewed adapters before reliable classification.

## Reviewed programme metadata

The Czech Fulbright source uses a separate `reviewed-rss` adapter with two precisely reviewed original URLs. It publishes only original Czech title, link and publication date; descriptions and images are excluded. One item is a programme-cycle overview, the other is an institution-restricted travel grant. Catalog cards and detail pages identify these distinctions; neither record establishes an open application call or unrestricted youth eligibility. Descriptions used for search and social metadata explain these limits in the project's own words.

The separate `reviewed-html` adapter indexes one exact NASA internship programme overview, one exact Portugal Fulbright master's programme overview and one exact Netherlands Fulbright doctoral programme overview. Canonical URL and the selected metadata identity must match the reviewed manifest: NASA uses JSON-LD `WebPage`; Portugal and the Netherlands use Open Graph URL/title. Only the original title, link and original publication date when available are retained; descriptions and images are excluded. Portugal and the Netherlands have no original publication date, so it remains null; an observed modification date never replaces publication. These records are programme information, not confirmed open youth application calls.

All reviewed metadata records retain unknown deadlines, availability, destination and eligible countries. Publisher geography does not establish applicant eligibility or destination. Newly observed items remain excluded until separately reviewed and added to the exact allowlist. The Netherlands and Portugal Fulbright RSS feeds remain disabled because their inspected entries did not provide qualifying calls; their programme-page adapters are distinct, narrowly reviewed acquisition paths. The Netherlands acquisition honors ten-second same-host spacing. See [the dated access review](/docs/access-review-2026-10-05/) for factual metadata limits, primary policy links and permission-required sources that remain disabled.

## Validation and identity

Records require stable IDs, original URLs, source identifiers and observation timestamps. Validation rejects unsafe URL schemes, embedded credentials, invalid dates, malformed country codes, unsupported categories, duplicate IDs within an adapter batch and non-plain or oversized summaries. IDs derive from the source and item URL. Different publishers mentioning the same programme may still have separate records; cross-publisher semantic deduplication is not implemented.

## Collection failures

The scheduled workflow restores the prior successful release before collecting. A failed source preserves its previous records and success timestamps, records a new attempt timestamp and exposes an error. Source errors do not pretend a new successful check occurred. If all enabled sources fail, the pipeline fails instead of publishing a replacement catalog.

The first collection has no previous state. Retention also depends on restoring prior state correctly; a local run without `PREVIOUS_CATALOG` cannot retain an earlier snapshot. Disabled sources are removed from the active output. Records disappearing from a feed remain retained while their source is enabled; absent items are not automatically declared closed.

## Status and publication

Known deadlines produce `open` or `expired` status; a missing deadline produces `unknown`. `open` means the supplied deadline has not passed, not that eligibility or availability was independently verified. Snapshot generation time differs from a source's last successful check.

Versioned release assets preserve published snapshots; the latest release pointer feeds the static site build. A site build failure should leave the last successful deployment available. Source-directory research evidence, integration status and content freshness are distinct facts and must not be conflated.
