# Accessibility and quality

The catalog uses complete static HTML pages. Category and destination links do not require browser-side filtering. A skip link and visible focus styles support keyboard navigation. The English interface can coexist with source text marked in its original language.

## Executed evidence

Independent QA rendered the homepage in Chromium 153 through Playwright at 1440 × 1000 and 390 × 844 pixels. The inspected desktop and mobile layouts had no horizontal overflow or browser JavaScript errors. QA checked the main landmark, primary heading and English page language; pressing Tab focused the visible skip link.

Calculated text contrast ratios were 5.54:1 for green `#00775b` on white, 5.81:1 for muted text `#53666b` on paper `#fafbf8`, and 14.19:1 for ink `#152b33` on paper. These combinations meet the WCAG AA normal-text contrast threshold; this is not a claim that every possible color combination was audited.

The website's automated tests cover static pagination, category and destination routes, escaped source text, original-source links, preserved language attributes, explicit unknown eligibility and rejection of unsupported catalog versions. Contributor tests cover identity handling and exclusions. Actual command results are recorded in the delivery issues rather than invented here.

## Limits and follow-up

No screen-reader assessment or complete WCAG conformance audit has been performed. Further QA checked the catalog, fellowships, sources, architecture docs, source research docs and contributors at both viewport sizes with JavaScript disabled: 12 rendered route checks showed no viewport overflow, failed requests or empty links. Tab and Enter activated the skip link to `#main`; the mobile research table was visually inspected. These checks do not establish compatibility with every browser, route or assistive technology. Broader screen-reader and source-language review remains part of ongoing QA. Report barriers with the affected URL, device and reproduction steps.
