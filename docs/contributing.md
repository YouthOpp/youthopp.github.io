# Contribute

Choose one useful change, make it easy to review, and leave the project clearer than you found it.

```flow
caption: From an idea to an accepted change
Issue | Agree on one problem and acceptance criteria
Change | Work in the owning repository
Independent review | Check behavior, evidence and docs
Maintainer | Merge, verify and close the issue
```

## Choose the right place

- **New source or collection fix:** data-pipeline.
- **Search, design, accessibility or documentation:** youthopps.org.
- **AI rules or skills:** ai-workspace.
- **Published data correction:** report it; do not open a development PR in data-source.

| Project | Questions and ideas | Bugs and concrete changes |
| --- | --- | --- |
| youthopps.org | [Discussions](https://github.com/YouthOpps/youthopps.github.io/discussions) | [Report an issue](https://github.com/YouthOpps/youthopps.github.io/issues/new) |
| data-pipeline | [Discussions](https://github.com/YouthOpps/data-pipeline/discussions) | [Report an issue](https://github.com/YouthOpps/data-pipeline/issues/new) |

## Mandatory AI workspace entry

All AI agents and AI-assisted developers are welcome only through [ai-workspace](https://github.com/YouthOpps/ai-workspace). Obtain it, initialize its submodules, and read its AGENTS.md and applicable skills before editing. Develop within the owning workspace submodule and submit an issue-linked PR to that repository. Direct development in standalone project clones is prohibited. If the workspace or required skills are unavailable, stop and report the blocker. data-source remains publication-only.

## Working rules

1. AI-assisted development must start inside an initialized ai-workspace submodule, not a standalone project clone. Read the [authoritative project rules and relevant skill](/docs/ai-rules/). Use English for project communication, code comments, documents and commits.
2. Work on one assigned issue in one repository. Fetch and verify only its current `origin/main`, preserve local changes, and align its checkout by creating `issue/<number>-<short-name>` from that revision. Alignment alone requires no commit or push; leave unrelated modules untouched.
3. Fix the complete affected flow. Keep code, dependencies and documentation small; preserve compatible behavior and unrelated work.
4. Independent subagents must review the result: inspect actual live JSON output for pipeline work and run browser UI tests against the built site for website implementation. Record commands, evidence, limitations and AI involvement. Self-review cannot replace independent acceptance.
5. For a working accepted result, open one PR with `[#<number>]` in its title and `Refs #<number>` in its body. This completes the agent's delivery; repository approval and merge belong to a separate authorized maintainer, who verifies the merged result, closes the issue and removes obsolete branches.
6. If reasonable permitted alternatives and meaningful troubleshooting find no working solution, independent subagents must confirm that outcome. Document attempts, evidence and future unblock conditions on the issue; add `unsolvable` and remove `in progress` when permitted. Keep the issue open and any PR unmerged so another agent or developer can revisit it. This concludes the attempt; a temporary blocker alone does not.

Do not commit or push changed ai-workspace submodule pointers as part of a project issue. Workspace maintenance may update skills, repository instructions, published rules and deliberate module revisions through maintenance PRs; project-owned edits use the owning project's PR. Never commit credentials or sensitive personal information.

Follow the applicable Google language style guide. Keep website source JSON pretty-printed with two spaces; build output JSON must be minified without changing its values. Formatting does not change repository or adapter boundaries.

## Add a source

An adapter is a self-contained source integration. Confirm permitted access, original links and genuine records before implementing it. Keep unknown dates, destinations and eligibility unknown.

Each implemented source has one `adapter.py`, one live non-publishing `test_adapter.py`, and one dedicated Action. All adapter behavior stays in its implementation file; no shared runtime or candidate scaffolds. Each adapter has a total limit of ten upstream requests per rolling minute with at least six seconds between requests, including retries, redirects, pagination and concurrent paths across endpoints. Serialize overlapping runs of the same adapter and honor stricter publisher limits.

```sh
python -B adapters/<source>/test_adapter.py
```

That live test fetches and validates the real source without publication credentials and emits actual collected JSON to stdout for independent QA inspection; diagnostics go to stderr. An unavailable source is a failure or blocker, not a pass. Authorized publication is separate: before the first successful publication, a failure creates no source folder, data or metadata; report it in execution logs. The first success creates data and metadata together, and later failures preserve last-good data while recording failure metadata when possible. The [adapter skill and QA reference](/docs/ai-rules/) define all requirements.

## Develop youthopps.org

Use Node.js 22 or later and initialize the pinned data-source submodule. With a compatible snapshot:

```sh
npm run check
python -m http.server 8080 --directory dist
```

`DATA_PATH` can select another read-only `datas/` snapshot. Website tests use isolated temporary fixtures; they never become real listings. Check desktop/mobile layouts, keyboard access, complete-collection search and affected source/detail pages.

Keep the shared brand and full-width layout through 2048 px. Update these guides with architectural changes. Maintain AI rules only in ai-workspace on GitHub; this site links to those authoritative files.
