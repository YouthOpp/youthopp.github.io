<img src="assets/youthopp-icon-v1.png" width="80" height="80" alt="YouthOpp logo">

# YouthOpp website

An English-language static opportunity catalog for nonprofit public benefit. Source titles preserve original language. Built using AI agents under human maintainer direction.

## Run

Node.js 22 or newer; no dependencies or paid backend.

```sh
npm test
CATALOG_PATH=../data-pipeline/dist/catalog.json CONTRIBUTORS_PATH=../data-pipeline/dist/contributors.json npm run build
python3 -m http.server 8080 --directory dist
```

Output: `dist/`. Without catalog data development builds show an honest empty state. Production requires the pipeline catalog and contributor snapshot from the same integrity-verified immutable release. The website does not collect source data or contributor history. Tests use temporary explicit fixtures, never published as real listings.

Configure `site.config.json` for canonical domain, webmaster verification and optional consent-gated analytics. Documentation in `docs/*.md` is published at `/docs/`. Build-time pagination keeps catalog data out of browser downloads.

Original project repositories: [YouthOpp/youthopp.github.io](https://github.com/YouthOpp/youthopp.github.io), [YouthOpp/data-pipeline](https://github.com/YouthOpp/data-pipeline), and [YouthOpp/.github](https://github.com/YouthOpp/.github). Production collection and publication use these original YouthOpp repositories. Development forks are only contribution branches and historical test evidence.

Production address: https://youthopps.org. Configure branding, canonical metadata, analytics and verification centrally in `site.config.json`; see [Website settings](docs/site-settings.md) for the exact fields and domain setup.

Pipeline technical documentation is maintained in this repository’s `docs/` and published under [Website Docs](https://youthopps.org/docs/). Start with [Pipeline architecture](https://youthopps.org/docs/architecture/), [Adapter guide](https://youthopps.org/docs/pipeline-adapters/) and [Pipeline operations](https://youthopps.org/docs/pipeline-operations/).



## Contact and support

For questions, proposals and project support, use [GitHub Discussions](https://github.com/YouthOpp/youthopp.github.io/discussions) first. For reproducible bugs, data problems or concrete work items, open a [GitHub Issue](https://github.com/YouthOpp/youthopp.github.io/issues). Email **contact@youthopps.org** when GitHub is unsuitable, especially for private or sensitive communication.
