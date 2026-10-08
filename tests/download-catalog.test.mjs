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
test('committed release pointer pins its manifest and protects existing output on tampering',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-pinned-download-'));const out=path.join(dir,'catalog.json');const pointer=path.join(dir,'pointer.json');
 const manifestBytes=Buffer.from(JSON.stringify(manifest));const calls=[];
 try{
  await fs.writeFile(pointer,JSON.stringify({schema_version:1,repository:'YouthOpps/data-pipeline',release_tag:manifest.release_tag,manifest_sha256:createHash('sha256').update(manifestBytes).digest('hex')}));
  const download=async(tag,asset,dest)=>{calls.push(tag);await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?manifestBytes:asset==='contributors.json'?contributorBytes:bytes);};
  await downloadCatalog({out,pointer,download});
  assert.deepEqual(calls,[manifest.release_tag,manifest.release_tag,manifest.release_tag]);
  await assert.rejects(()=>downloadCatalog({out,pointer,download:async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),Buffer.from('tampered manifest'));}}),/manifest SHA-256 mismatch/);
  assert.deepEqual(await fs.readFile(out),bytes);
  await fs.writeFile(pointer,JSON.stringify({schema_version:1,repository:'untrusted/repo',release_tag:manifest.release_tag,manifest_sha256:'0'.repeat(64)}));
  await assert.rejects(()=>downloadCatalog({out,pointer,download}),/Invalid catalog release pointer/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('public release downloads need no CLI or token and pin both assets to the manifest',async t=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-public-download-'));
 const calls=[];
 const fetchMock=t.mock.method(globalThis,'fetch',async(url,options)=>{
  calls.push([url,options]);
  return new Response(url.endsWith('/manifest.json')?JSON.stringify(manifest):url.endsWith('/contributors.json')?contributorBytes:bytes);
 });
 try{
  await downloadCatalog({out:path.join(dir,'catalog.json'),pointer:path.join(dir,'missing-pointer.json')});
  assert.deepEqual(calls.map(([url])=>url),[
   'https://github.com/YouthOpps/data-pipeline/releases/download/catalog-latest/manifest.json',
   'https://github.com/YouthOpps/data-pipeline/releases/download/catalog-123-2/catalog.json',
   'https://github.com/YouthOpps/data-pipeline/releases/download/catalog-123-2/contributors.json'
  ]);
  assert.ok(calls.every(([,options])=>!options.headers&&options.signal));
  fetchMock.mock.mockImplementation(async()=>new Response('not found',{status:404}));
  await assert.rejects(()=>downloadCatalog({out:path.join(dir,'catalog.json'),pointer:path.join(dir,'missing-pointer.json')}),/HTTP 404/);
  assert.deepEqual(await fs.readFile(path.join(dir,'catalog.json')),bytes);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
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
  await downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download});
  assert.deepEqual(calls,[['catalog-latest','manifest.json'],['catalog-123-2','catalog.json'],['catalog-123-2','contributors.json']]);
  assert.deepEqual(await fs.readFile(out),bytes);
  assert.deepEqual(await fs.readFile(path.join(dir,'contributors.json')),contributorBytes);
  await assert.rejects(()=>downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download:async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):'broken');}}),/mismatch/);
  assert.deepEqual(await fs.readFile(out),bytes);
  await assert.rejects(()=>downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download:async()=>{throw new Error('Release asset unavailable');}}),/unavailable/);
  assert.deepEqual(await fs.readFile(out),bytes);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('missing or corrupt contributors prevents replacement of either verified snapshot',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-contributor-integrity-'));const out=path.join(dir,'catalog.json');const contributorsOut=path.join(dir,'contributors.json');
 try{
  await fs.writeFile(out,'previous catalog');await fs.writeFile(contributorsOut,'previous contributors');
  const download=async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):asset==='catalog.json'?bytes:Buffer.alloc(contributorBytes.length,0));};
  await assert.rejects(()=>downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download}),/SHA-256 mismatch/);
  const oldManifest={...manifest,assets:{'catalog.json':manifest.assets['catalog.json']}};
  await assert.rejects(()=>downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download:async(tag,asset,dest)=>{await fs.writeFile(path.join(dest,asset),JSON.stringify(oldManifest));}}),/contributors.json manifest/);
  await assert.rejects(()=>downloadCatalog({out,pointer:path.join(dir,'missing-pointer.json'),download:async(tag,asset,dest)=>{if(asset==='contributors.json')throw new Error('Contributor asset unavailable');await fs.writeFile(path.join(dest,asset),asset==='manifest.json'?JSON.stringify(manifest):bytes);}}),/unavailable/);
  assert.equal(await fs.readFile(out,'utf8'),'previous catalog');assert.equal(await fs.readFile(contributorsOut,'utf8'),'previous contributors');
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
