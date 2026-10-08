import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {build} from '../scripts/build.mjs';
import {writeSources} from './helpers.mjs';
test('country selection includes later pages and opens records instead of publisher cards',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-country-records-'));
 try{
  const input=path.join(dir,'datas');const out=path.join(dir,'site');
  const records=Array.from({length:31},(_,i)=>({id:`record-${i}`,title:`Programme ${i}`,summary:'',category:'scholarships',source:'publisher',publisher_country:i===30?'DE':'US',host_countries:i===30?['FR']:[],eligible_countries:[],kind:'programme-overview',status:'unknown',url:`https://example.org/${i}`}));
  records.push({...records[30],id:'directory-only',title:'Publisher directory only',url:'https://example.org/directory',kind:'unknown'});
  await writeSources(input,{schema_version:1,opportunities:records,sources:[{source:'publisher',name:'Publisher',publisher_country:'US',website_url:'https://example.org'}]});
  const result=await build({input,out});
  const list=await fs.readFile(path.join(out,'opportunities/index.html'),'utf8');
  assert.ok(list.includes('name="country"'));assert.ok(list.includes('name="destination"'));assert.ok(list.includes('data-index='));
  assert.ok(result.routes.includes('/opportunities/from/de/'));
  const script=list.match(/src="(\/assets\/index\.[a-f0-9]{16}\.js)"/)[1];assert.equal(await fs.readFile(path.join(out,script),'utf8'),await fs.readFile(new URL('../assets/index.js',import.meta.url),'utf8'));
  const german=await fs.readFile(path.join(out,'opportunities/from/de/index.html'),'utf8');
  assert.ok(german.includes('class="opportunity"'));assert.ok(german.includes('Programme 30'));assert.ok(!german.includes('class="source-card"'));
  assert.ok(!german.includes('Programme 0</a>'));
  assert.ok(!german.includes('Publisher directory only'));await fs.access(path.join(out,'opportunity/directory-only/index.html'));
  const report=JSON.parse(await fs.readFile(path.join(out,'build-report.json'),'utf8'));assert.equal(report.records.length,32);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
