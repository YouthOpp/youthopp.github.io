# Architecture

YouthOpp is a nonprofit, community-maintained opportunity index. It lowers the effort of discovering scholarships, internships and related opportunities while directing readers to the original publisher. Publishers remain authoritative for eligibility, funding, deadlines and applications.

## AI-led development

The project idea, development and management use AI agents under human direction. Product, architecture, research, implementation and quality assurance decisions are documented openly. This is also a learning environment where students and recent graduates can build practical AI experience, demonstrate contributions and improve their visibility for scholarships, internships and first jobs. Participation does not guarantee any award or employment. Agents are roles, not separate GitHub identities; public automation is disclosed.

## Free baseline

GitHub repositories hold code and source definitions; Actions runs collection and validation; release assets publish normalized data; Cloudflare Pages builds and hosts HTML, CSS and JavaScript. There is no runtime backend, database, mandatory paid API or inference service. Public hosting and automation have quotas and operational limits. The application remains useful without analytics and without browser JavaScript.

## Repository responsibilities

| Repository | Responsibility |
| --- | --- |
| [YouthOpp/data-pipeline](https://github.com/YouthOpp/data-pipeline) | Source registry, adapters, normalization, validation, collection, contributor history and dataset publication |
| [YouthOpp/youthopp.github.io](https://github.com/YouthOpp/youthopp.github.io) | English interface, pre-rendered catalogs, documentation, contributor profiles, search metadata and Pages build |
| [YouthOpp/.github](https://github.com/YouthOpp/.github) | Mission, contribution guidance, community governance and issue templates |

## Delivery flow

A trusted scheduled workflow collects enabled sources. It validates each result and preserves the last successful snapshot when a source fails. A consolidated catalog is published with a generation time and schema version. A website build selects one dataset version, generates category and country pagination plus detail pages, presents the pipeline-provided contributor snapshot and deploys only after validation succeeds.

Render lists in bounded pages rather than downloading the complete catalog into browsers. Country catalogs refer to the opportunity's host country; publisher country and eligible applicant countries remain separate. Unknown metadata must stay unknown. Full-text global search is outside the free baseline; on-page refinement must clearly identify its scope.

## Trust model

Every card provides the original source link, source identity and last successful collection time. A fetched page is not evidence that its application is open. Missing deadlines produce an unconfirmed status; passed deadlines produce expired status. Preserve source language and label it correctly. Never turn an AI inference into an authoritative eligibility condition.

## Contributor visibility

The pipeline rebuilds profiles from the default-branch history of the original YouthOpp repository histories. Inherited upstream history is preserved; identical commit hashes are counted once across repositories. Author mapping uses paginated GitHub API requests and available public noreply identities. Award one point per attributable authored non-merge commit, excluding bots, automated dataset updates and messages beginning `Open AI agent:`. AI-prefixed work is excluded from scores rather than displayed as a separate ranking. Publish the formula, collection time, unresolved identities and partial-collection warnings. Scores reflect recorded activity, not capability or hiring suitability. The website only consumes the integrity-verified contributor snapshot from the same immutable pipeline release as the catalog; neither production website builds nor PR validation collect history.

## Discovery

Use meaningful HTML headings, canonical URLs, page descriptions, sitemaps, robots directives, OpenGraph/Twitter previews and accurate structured data. The current generator emits project Organization, WebSite, CollectionPage/WebPage and route BreadcrumbList structured data without claiming registered charitable status. Use JobPosting only for real job listings. Optional llms.txt helps discover documentation but does not promise AI search ranking. No marketing claims about scale or institutional support without evidence.

Production configuration targets the original YouthOpp repositories for collection, contributor history and deployment. Development forks remain contribution branches and dated test evidence. Successful historical fork runs do not establish that these original-repository PRs have been merged or that original production has been accepted.

## Documentation authority

Pipeline technical architecture, data contracts, adapter instructions and operations live in this website repository’s `docs/` and render under https://youthopps.org/docs/. The pipeline links to those pages rather than maintaining a second independently edited technical guide. Executable schemas, adapter fixtures, source manifests and datasets remain owned by the pipeline.

