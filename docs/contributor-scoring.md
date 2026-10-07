# Contributor scoring

YouthOpp recognizes public contributions without treating activity as a measure of talent, personal worth or employability.

## How the score is calculated

One point is awarded for each attributable authored non-merge commit in the configured default-branch histories for the three project components: YouthOpp/.github, YouthOpp/youthopp.github.io and YouthOpp/data-pipeline. The production collector reads these original repository histories. Development-fork-only commits do not enter original-production scores. Identical commit hashes are counted once across all three repositories. Merge commits, bot authors, the historical automated dataset-update message and messages beginning `Open AI agent:` are excluded. AI-generated delivery commits therefore do not inflate a person's score; they are excluded rather than displayed in a separate ranking.

GitHub's public commit-author mapping identifies profiles. GitHub noreply addresses can identify a login when API mapping is unavailable. Other identities are not guessed from display names or private email addresses. The page reports unresolved commits and partial collection; the score includes only evidence the collector can attribute.

## Limits

Commit count does not reflect effort, code quality, reviews, mentoring, research, design or all non-code work. Squashed work appears as one commit. Pull requests, issues and reviews are not scored in this version. A missing profile does not mean someone did not contribute. The collector uses full Git history, while API author mapping is limited to 100 pages per repository and marks incomplete requests as partial.

Each pipeline publication attempts a fresh collection; the website consumes its published snapshot without querying repository histories. Partial repository or author-mapping failures are published with warnings and unresolved counts. If every repository history fetch fails, the collector preserves the existing local file and exits with an error; the pipeline publication stops rather than silently deploying an old ranking. The previous successful Pages deployment remains available. Offline builds may use a local snapshot, and the contributor page shows its original collection timestamp.

## Public data and correction

Only public GitHub login, profile/avatar URL, repository attribution and counted activity are shown. Names default to the public login. Private email addresses are not published. To request a correction, open a GitHub issue; explain the public evidence that should be reviewed.

## Reproduce

In [YouthOpp/data-pipeline](https://github.com/YouthOpp/data-pipeline), run `npm run contributors` to produce `dist/contributors.json`; run `node --test tests/contributors.test.js` for scoring checks. Build the website with `CATALOG_PATH` and optional `CONTRIBUTORS_PATH` pointing to the matching pipeline outputs. Production verifies both assets against the same immutable release manifest; contributor collection code and snapshots are not checked into the UI repository.
