import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {compactJsonOutput} from '../scripts/json-output.mjs';

test('output minification preserves values and leaves source JSON alone', async t => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'json-output-'));
  t.after(() => fs.rm(directory, {recursive: true, force: true}));
  const output = path.join(directory, 'dist');
  const source = path.join(directory, 'source.json');
  const value = {text: ' spaces  stay\ninside strings ', values: [null, 1, true]};
  const pretty = JSON.stringify(value, null, 2) + '\n';
  await fs.mkdir(path.join(output, 'assets'), {recursive: true});
  await fs.writeFile(source, pretty);
  await fs.writeFile(path.join(output, 'assets', 'copied.json'), pretty);
  await compactJsonOutput(output);
  const compact = await fs.readFile(path.join(output, 'assets', 'copied.json'), 'utf8');
  assert.equal(compact, JSON.stringify(value) + '\n');
  assert.deepEqual(JSON.parse(compact), value);
  assert.equal(await fs.readFile(source, 'utf8'), pretty);
});
