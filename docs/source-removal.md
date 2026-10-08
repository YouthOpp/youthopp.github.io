# Source removal requests

YouthOpp is an independent search index of factual titles and links. Inclusion does not mean that a publisher endorses YouthOpp. We avoid copying source content and direct visitors to the original publisher for authoritative details.

## Request removal

You can [open an issue](https://github.com/YouthOpp/data-pipeline/issues/new) or [submit a pull request](https://github.com/YouthOpp/data-pipeline/pulls). Either is enough to start a practical human review; submission does not guarantee that a request will be accepted.

Include:

- The exact indexed title.
- The source URL or URLs to remove.
- A reason, if you want to provide one.

Do not include personal, confidential or sensitive information in a public issue or pull request. If the request concerns personal, confidential or sensitive information, do not post it publicly; email **contact@youthopps.org** instead. For non-sensitive questions before filing a request, use [GitHub Discussions](https://github.com/YouthOpp/youthopp.github.io/discussions).

## Pull request process

To stop collection for a whole source, edit `data/sources/sources.json` in [YouthOpp/data-pipeline](https://github.com/YouthOpp/data-pipeline) and set the matching source entry to `enabled: false`. This stops scheduled requests and excludes that source's records from the next validated current catalog. Its directory entry remains documented with collection disabled.

If the request also seeks removal from the current source directory, say so explicitly. Maintainers must review removal of the matching manifest and `data/sources/source-registry.json` entry together. Historical releases and Git history are separate and are not rewritten by disabling or removing a current source definition.

For one indexed link, open an issue with its exact title and URL so a maintainer can identify the narrowest appropriate change. Submission does not itself remove or hide a record.
