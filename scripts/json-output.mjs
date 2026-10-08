import fs from 'node:fs/promises';
import path from 'node:path';
import {isDeepStrictEqual} from 'node:util';

/** Minifies JSON only inside the already validated website output directory. */
export async function compactJsonOutput(directory) {
  for (const entry of await fs.readdir(directory, {withFileTypes: true})) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await compactJsonOutput(filename);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const value = JSON.parse(await fs.readFile(filename, 'utf8'));
      const serialized = JSON.stringify(value);
      if (!isDeepStrictEqual(value, JSON.parse(serialized))) {
        throw new Error(`JSON serialization would change values: ${filename}`);
      }
      await fs.writeFile(filename, serialized + '\n');
    }
  }
}
