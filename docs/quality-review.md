# Independent quality review

Reviewed by AI Agent — QA on 4 October 2026.

## Executed checks

- Pipeline: nine developer tests plus independent acceptance checks. Verified original links and language, bounded summaries, stable identity, unknown country/eligibility/deadline semantics, invalid date and URL rejection, outage preservation, and total-failure publication guard.
- Website: five developer tests plus independent 65-record build. Verified 30-record pagination across global, category and country catalogs and fellowship coverage. Synthetic fixtures are separate from production data.
- Live build: 20 source-linked records. Independently audited every generated HTML page for English document language, one primary heading, title, description, canonical URL, accessible image attributes and local links. No broken local links found.
- Browser: Chromium 153 through Playwright, desktop width 1440 and mobile width 390. Homepage and six key routes rendered without horizontal overflow or failed requests. Core catalog, source, documentation and contributor pages worked with JavaScript disabled. Keyboard Tab and Enter activated the skip link. Inspected actual homepage and mobile documentation screenshots.
- Contrast calculations: green text on white 5.54:1, muted text on page background 5.81:1, primary text on page background 14.19:1.
- Actions reviewed: contribution tests are read-only and fixture-based; publication is restricted to trusted default-branch execution. Durable previous state is restored by exact release tag and failures other than first-run absence stop publication.

## Findings corrected during review

Source field mismatches, missing fellowship category, invalid-date classification, reset update timestamps, missing documentation routes, unsupported catalog versions, misleading contributor activity types and release-list pagination that could discard old state were reported and corrected.

## Limits and rollout dependencies

This is scoped quality verification, not WCAG certification or a guarantee about publisher opportunities. Screen-reader testing and broad device testing remain future work. Source accessibility and rights reviews remain explicit and pending where unresolved. Research candidates are not integrated adapters. Most RSS records do not supply structured destination or eligibility metadata, so those fields remain unknown. The original Opportunities for Youth feed returned HTTP 403 during live collection; two other feeds supplied the 20 records. Production website deployment needs a successful pipeline catalog release first and GitHub Pages configured for Actions. Search and analytics account identifiers must be supplied by maintainers.
