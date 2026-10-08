# Security and quality boundaries

External feed content and contributor data are untrusted. Escape HTML text and attributes, restrict outbound links to HTTP(S), and never execute source markup or render arbitrary remote scripts. Sanitize summaries as plain text. Structured data must serialize safely and cannot allow closing-script injection.

PR tests use read-only permissions and fixed fixtures. Do not use `pull_request_target` to execute contributor code, expose secrets to fork PRs, or run unreviewed adapters in privileged publication jobs. Scheduled trusted-main publication receives only necessary contents permission; website deploy receives scoped Pages and identity permissions. Never log tokens.

Adapter endpoint configuration requires review. Reject local/private network endpoints and embedded credentials, constrain redirects, response size, timeout and concurrency where network collection is enabled. Keep dependency installation reproducible and separate network smoke checks from deterministic tests.

Publication gates include catalog schema validation, stable identity, truthful freshness on source failure, no invented opportunities, correct source URLs, route/link integrity, accessible headings and form labels, keyboard operation, responsive layout and indexable HTML without JavaScript. Browser filtering must not imply it searches records that were never loaded.

Contributor activity is a transparent count, not a quality judgment. Exclude bots and disclose AI-authored work so a user account is not misleadingly credited with independent human effort. Do not publish contributor email addresses from Git history.

Original publishers control application terms. Summaries preserve attribution and direct visitors to the official page. Retrieval adapters should respect documented source access conditions and rate limits; uncertain access remains a research candidate until verified.

The nonprofit mission does not establish legal charitable status or institutional endorsement. Pages must not invent endorsements, success statistics, scholarships awarded or employment outcomes. Testing provides evidence for the tested release, not a guarantee of zero defects or unlimited service.


## Contact

Use [GitHub Discussions](https://github.com/YouthOpp/youthopp.github.io/discussions) for general security questions and [GitHub Issues](https://github.com/YouthOpp/youthopp.github.io/issues) for non-sensitive reproducible problems. Do not publish vulnerabilities, credentials, personal data or other sensitive details. For private or sensitive security communication, email **contact@youthopps.org**.
