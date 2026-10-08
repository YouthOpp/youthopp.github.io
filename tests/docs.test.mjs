import test from 'node:test';
import assert from 'node:assert/strict';
import {markdown} from '../scripts/docs.mjs';

test('headings have stable anchors and paragraph lines join', () => {
  const html = markdown([
    '# Project',
    '',
    'A short',
    'paragraph.',
    '',
    '## Data & flow',
    '## Data & flow',
  ].join('\n'));
  assert.match(html, /<h1 id="project" class="page-title">Project<\/h1>/);
  assert.match(html, /<p>A short paragraph\.<\/p>/);
  assert.match(html, /id="data-flow"/);
  assert.match(html, /id="data-flow-2"/);
});

test('HTML stays text and unsafe links cannot become navigation', () => {
  const html = markdown([
    '<script>alert(1)</script>',
    '',
    '```js',
    '<img src=x onerror=alert(1)>',
    '```',
    '',
    '[Bad](javascript:alert) [Bad](//evil.test) [Bad](/\\evil.test)',
    '[Safe](https://example.org/?a=1&b=2) [Section](#data)',
    '[Contact](mailto:team@example.org) [Docs](/docs/)',
  ].join('\n'));
  assert.doesNotMatch(
      html, /<script|<img|href="javascript|href="\/\/|href="\/\\/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /<pre><code>&lt;img/);
  assert.match(html, /href="https:\/\/example.org\/\?a=1&amp;b=2"/);
  assert.match(html, /href="#data"/);
  assert.match(html, /href="mailto:team@example.org"/);
  assert.match(html, /href="\/docs\/"/);
});

test('flow diagrams are semantic figures with escaped nodes', () => {
  const html = markdown([
    '```flow',
    'caption: How data moves',
    'Pipeline | Collect & validate',
    'Source | <Published> data',
    'Website | Present opportunities',
    '```',
  ].join('\n'));
  assert.match(html, /<figure class="doc-flow"><figcaption>/);
  assert.match(html, /How data moves<\/figcaption><ol>/);
  assert.equal((html.match(/<li>/g) || []).length, 3);
  assert.match(
      html, /<strong>Source<\/strong><span>&lt;Published&gt; data<\/span>/);
});

test('details preserve lists, headings and fenced delimiters', () => {
  const html = markdown([
    '# Guide',
    ':::details Full **rules**',
    '# Rules',
    '## Scope',
    '- One',
    '- Two',
    '  - Nested',
    '',
    '```yaml',
    ':::',
    '```',
    ':::details Nested reference',
    '# Reference',
    ':::',
    ':::',
    '',
    '## Next',
  ].join('\n'));
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /<details class="doc-details"><summary>/);
  assert.match(html, /Full <strong>rules<\/strong><\/summary>/);
  assert.match(html, /<h3 id="rules">/);
  assert.match(html, /<h4 id="scope">/);
  assert.match(html, /<ul><li><p>Nested<\/p><\/li><\/ul>/);
  assert.match(html, /<pre><code>:::<\/code><\/pre>/);
  assert.match(html, /<\/details>\n<h2 id="next">/);
});

test('ordered lists and tables retain semantic structure', () => {
  const html = markdown([
    '1. Read `data`',
    '2. **Validate**',
    '',
    '| Repo | Role |',
    '| --- | --- |',
    '| pipeline | Collect |',
  ].join('\n'));
  assert.match(html, /<ol><li><p>Read <code>data<\/code><\/p><\/li>/);
  assert.match(html, /<strong>Validate<\/strong>/);
  assert.match(html, /<thead><tr><th scope="col">Repo<\/th>/);
  assert.match(html, /<tbody><tr><td>pipeline<\/td><td>Collect<\/td>/);
});

test('code-like content does not prematurely close details', () => {
  const html = markdown([
    ':::details Example',
    '```text',
    '```not-a-closing-fence',
    ':::',
    '<script>still text</script>',
    '```',
    'Visible inside details.',
    ':::',
    'After details.',
  ].join('\n'));
  assert.match(html, /&lt;script&gt;still text&lt;\/script&gt;/);
  assert.match(html, /<p>Visible inside details\.<\/p><\/details>/);
  assert.match(html, /<\/details>\n<p>After details\.<\/p>/);
});
