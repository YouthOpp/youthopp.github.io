import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {loadData,deadlineTime,publicMetadata} from '../scripts/data.mjs';
const record = overrides => ({id:'record-1',title:'Original title',summary:'Short description',url:'https://example.org/apply',category:'training',status:'expired',host_countries:['TR'],eligible_countries:[],deadline:'2025-01-01',...overrides});
async function fixture(t, records=[record()], metadata={status:'fail',title:'Source title',error:'Failed',last_success_at:'2025-01-01'}) {
 const root=await fs.mkdtemp(path.join(os.tmpdir(),'website-data-'));
 t.after(()=>fs.rm(root,{recursive:true,force:true}));
 await fs.mkdir(path.join(root,'example-source'));
 await fs.writeFile(path.join(root,'example-source','data.json'),JSON.stringify(records));
 await fs.writeFile(path.join(root,'example-source','metadata.json'),JSON.stringify(metadata));
 return root;
}
test('failed sources retain last-good and expired records with authoritative folder identity',async t=>{
 const root=await fixture(t,[record({source:'wrong'}),record({id:'unknown',deadline:null}),record({id:'earlier',deadline:'2024-01-01'})]);
 const result=await loadData(root);
 assert.deepEqual(result.opportunities.map(r=>r.id),['earlier','record-1','unknown']);
 assert.equal(result.opportunities[0].source,'example-source');
 assert.equal(result.sources[0].name,'Source title');
 assert.equal(result.sources[0].status,'fail');
 assert.equal(result.sources[0].last_success_at,'2025-01-01');
});
test('empty sources are valid but missing and malformed files fail',async t=>{
 const root=await fixture(t,[],{status:'success'});
 assert.equal((await loadData(root)).opportunities.length,0);
 await fs.writeFile(path.join(root,'example-source','metadata.json'),'{');
 await assert.rejects(loadData(root),/Cannot read required source input/);
 await fs.unlink(path.join(root,'example-source','metadata.json'));
 await assert.rejects(loadData(root),/Cannot read required source input/);
 await assert.rejects(loadData(path.join(root,'absent')),/Required datas directory/);
});
test('unsafe records and duplicate route IDs fail',async t=>{
 const root=await fixture(t,[record(),record({id:'RECORD-1'})]);
 await assert.rejects(loadData(root),/Duplicate or unsafe/);
 await fs.writeFile(path.join(root,'example-source','data.json'),JSON.stringify([record({id:'record--1'})]));
 await assert.rejects(loadData(root),/Duplicate or unsafe/);
 await fs.writeFile(path.join(root,'example-source','data.json'),JSON.stringify([record({url:'javascript:alert(1)'})]));
 await assert.rejects(loadData(root),/Malformed opportunity/);
});
test('public metadata recursively redacts secrets and diagnostic values',()=>{
 const clean=publicMetadata({title:'Public title',nested:{api_key:'private',error:'Authorization: Bearer abc.def mail person@example.org password=secret https://user:pass@example.org/?token=abc'},token:'hidden'});
 assert.equal(clean.title,'Public title');
 assert.equal(clean.nested.api_key,undefined);
 assert.equal(clean.token,undefined);
 assert.doesNotMatch(clean.nested.error,/abc\.def|person@example|password=secret|user:pass|token=abc/);
});
test('date-only deadlines include the full UTC day',()=>{
 assert.equal(deadlineTime('2026-10-08'),Date.parse('2026-10-08T23:59:59.999Z'));
 assert.equal(deadlineTime(null),Infinity);
 assert.equal(deadlineTime('2026-02-30'),Infinity);
 assert.equal(deadlineTime('2026-10-08T12:00:00'),Infinity);
 assert.equal(deadlineTime('2026-10-08T12:00:00+03:00'),Date.parse('2026-10-08T09:00:00Z'));
});
test('quoted diagnostic credentials and encoded personal query values are redacted',()=>{
 const clean=publicMetadata({error:'password="two words secret"; api-key: multiple words here; https://example.org/?contact=person%40example.org&token=secret'});
 assert.doesNotMatch(clean.error,/two words|multiple words|person|%40|token=secret/);
});
test('invalid calendar dates and ambiguous timestamps fail rather than shift deadlines',async t=>{
 const root=await fixture(t,[record({deadline:'2026-02-30'})]);
 await assert.rejects(loadData(root),/Invalid opportunity date/);
 await fs.writeFile(path.join(root,'example-source','data.json'),JSON.stringify([record({deadline:'2026-10-08T12:00:00'})]));
 await assert.rejects(loadData(root),/Invalid opportunity date/);
 await fs.writeFile(path.join(root,'example-source','data.json'),'[]');
 await fs.writeFile(path.join(root,'example-source','metadata.json'),JSON.stringify({status:'success',last_success_at:'2026-02-30'}));
 await assert.rejects(loadData(root),/Invalid source metadata date/);
});
