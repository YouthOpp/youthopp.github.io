import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {build} from '../scripts/build.mjs';

test('publisher country pages include failed sources without inferring opportunity destinations',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-publisher-countries-'));
 try{
  const input=path.join(dir,'catalog.json');const out=path.join(dir,'out');
  await fs.writeFile(input,JSON.stringify({schema_version:1,sources:[
   {source:'de-source',name:'German publisher',publisher_country:'DE',status:'error',error:'Fetch failed',website_url:'https://example.org/de'},
   {source:'global',name:'Global publisher',publisher_country:'GLOBAL',website_url:'https://example.org/global'}
  ],source_registry:[{id:'fr-source',name:'French publisher',publisher_country:'FR',url:'https://example.org/fr'}],opportunities:[
   {id:'record',title:'Programme',summary:'',category:'scholarships',source:'de-source',host_countries:[],eligible_countries:[],status:'unknown',url:'https://example.org/programme'}
  ]}));
  const result=await build({input,out,config:{url:'https://example.org/project'}});
  for(const route of ['/sources/countries/','/sources/countries/de/','/sources/countries/fr/','/sources/countries/international/'])assert.ok(result.routes.includes(route));
  assert.ok(!result.routes.includes('/countries/de/'));
  const german=await fs.readFile(path.join(out,'sources/countries/de/index.html'),'utf8');
  assert.ok(german.includes('<h2>German publisher</h2>'));assert.ok(!german.includes('<h2>French publisher</h2>'));
  assert.ok(german.includes('Latest collection error: Fetch failed'));
  assert.ok(german.includes('href="/project/sources/countries/fr/"'));
  const global=await fs.readFile(path.join(out,'sources/countries/international/index.html'),'utf8');assert.ok(global.includes('<h2>Global publisher</h2>'));
  const opportunity=await fs.readFile(path.join(out,'opportunity/record/index.html'),'utf8');assert.ok(opportunity.includes('<dt>Destination</dt><dd>Not provided</dd>'));
  const home=await fs.readFile(path.join(out,'index.html'),'utf8');assert.ok(home.includes('>Countries</a>'));assert.ok(home.includes('href="/project/opportunities/from/de/"'));
  const sitemap=await fs.readFile(path.join(out,'sitemap.xml'),'utf8');assert.ok(sitemap.includes('https://example.org/project/sources/countries/fr/'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

