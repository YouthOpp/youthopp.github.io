import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {validateManifest,verifyCatalog,downloadCatalog} from '../scripts/download-catalog.mjs';
const bytes=Buffer.from('{"schema_version":1,"opportunities":[],"sources":[],"source_registry":[]}');
const contributorBytes=Buffer.from(JSON.stringify({generated_at:'2026-10-05T07:00:00Z',status:'complete',contributors:[]}));
const manifest={schema_version:1,release_tag:'catalog-123-2',assets:{'catalog.json':{sha256:createHash('sha256').update(bytes).digest('hex'),size:bytes.length},'contributors.json':{sha256:createHash('sha256').update(contributorBytes).digest('hex'),size:contributorBytes.length}}};
test('release integrity rejects mutable pointers, missing manifests and corrupted bytes',()=>{
 assert.equal(verifyCatalog(bytes,manifest).releaseTag,'catalog-123-2');
 assert.throws(()=>validateManifest({...manifest,release_tag:'catalog-latest'}),/immutable release tag/);
 assert.throws(()=>validateManifest({schema_version:1}),/immutable release tag/);
 assert.throws(()=>validateManifest({...manifest,assets:{}}),/integrity metadata/);
 assert.throws(()=>verifyCatalog(bytes.subarray(1),manifest),/byte-size mismatch/);
 const corrupt=Buffer.from(bytes);corrupt[0]=0;
 assert.throws(()=>verifyCatalog(corrupt,manifest),/SHA-256 mismatch/);
});
test('production downloader resolves immutable snapshot and preserves previous catalog on failure',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-download-test-'));const out=path.join(dir,'catalog.json');const calls=[];
 try{
  const download=async(tag,asset,dest)=>{calls.push([tag,asset]);await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):asset==='contributors.json'?contributorBytes:bytes);};
  await downloadCatalog({out,download});
  assert.deepEqual(calls,[['catalog-latest','manifest.json'],['catalog-123-2','catalog.json'],['catalog-123-2','contributors.json']]);
  assert.deepEqual(await fs.readFile(out),bytes);
  assert.deepEqual(await fs.readFile(path.join(dir,'contributors.json')),contributorBytes);
  await assert.rejects(()=>downloadCatalog({out,download:async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):'broken');}}),/mismatch/);
  assert.deepEqual(await fs.readFile(out),bytes);
  await assert.rejects(()=>downloadCatalog({out,download:async()=>{throw new Error('Release asset unavailable');}}),/unavailable/);
  assert.deepEqual(await fs.readFile(out),bytes);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('missing or corrupt contributors prevents replacement of either verified snapshot',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-contributor-integrity-'));const out=path.join(dir,'catalog.json');const contributorsOut=path.join(dir,'contributors.json');
 try{
  await fs.writeFile(out,'previous catalog');await fs.writeFile(contributorsOut,'previous contributors');
  const download=async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):asset==='catalog.json'?bytes:Buffer.alloc(contributorBytes.length,0));};
  await assert.rejects(()=>downloadCatalog({out,download}),/SHA-256 mismatch/);
  const oldManifest={...manifest,assets:{'catalog.json':manifest.assets['catalog.json']}};
  await assert.rejects(()=>downloadCatalog({out,download:async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),JSON.stringify(oldManifest));}}),/contributors.json manifest/);
  await assert.rejects(()=>downloadCatalog({out,download:async(tag,asset,dest)=>{if(asset==='contributors.json')throw new Error('Contributor asset unavailable');await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):bytes);}}),/unavailable/);
  assert.equal(await fs.readFile(out,'utf8'),'previous catalog');assert.equal(await fs.readFile(contributorsOut,'utf8'),'previous contributors');
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
