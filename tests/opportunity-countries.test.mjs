import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {build} from '../scripts/build.mjs';
test('country selection includes later pages and opens records instead of publisher cards',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-country-records-'));
 try{
  const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');
  const records=Array.from({length:31},(_,i)=>({id:`record-${i}`,title:`Programme ${i}`,summary:'',category:'scholarships',source:'publisher',publisher_country:i===30?'DE':'US',host_countries:i===30?['FR']:[],eligible_countries:[],kind:'programme-overview',status:'unknown',url:`https://example.org/${i}`}));
  await fs.writeFile(input,JSON.stringify({schema_version:1,opportunities:records,sources:[{source:'publisher',name:'Publisher',publisher_country:'US',website_url:'https://example.org'}]}));
  const result=await build({input,out});
  const list=await fs.readFile(path.join(out,'opportunities/index.html'),'utf8');
  assert.ok(list.includes('data-route="/opportunities/from/de/"'));assert.ok(list.includes('data-route="/countries/fr/"'));
  assert.ok(result.routes.includes('/opportunities/from/de/'));
  const german=await fs.readFile(path.join(out,'opportunities/from/de/index.html'),'utf8');
  assert.ok(german.includes('class="opportunity"'));assert.ok(german.includes('Programme 30'));assert.ok(!german.includes('class="source-card"'));
  assert.ok(!german.includes('Programme 0</a>'));
  const report=JSON.parse(await fs.readFile(path.join(out,'build-report.json'),'utf8'));assert.equal(report.records.length,31);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
