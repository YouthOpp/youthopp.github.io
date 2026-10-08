import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {writeSitemaps} from '../scripts/sitemaps.mjs';

test('index references child XML files, and source files contain only their own local detail pages',async()=>{
 const out=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-sitemaps-'));
 try{
  const routes=['/','/sources/','/opportunity/one/','/opportunity/two/','/opportunity/three/'];
  const records=[{id:'one',source:'campus-france',url:'https://external.example/one'},{id:'two',source:'campus-france'},{id:'three',source:'other'}];
  await writeSitemaps({out,siteUrl:'https://example.org/project',routes,records});
  const index=await fs.readFile(path.join(out,'sitemap.xml'),'utf8');
  assert.ok(index.includes('<sitemapindex'));assert.ok(!index.includes('<url>'));assert.ok(!index.includes('/opportunity/'));
  assert.ok(index.includes('https://example.org/project/sitemap-source-campus-france.xml'));
  const campus=await fs.readFile(path.join(out,'sitemap-source-campus-france.xml'),'utf8');
  assert.ok(campus.includes('https://example.org/project/opportunity/one/'));assert.ok(campus.includes('/opportunity/two/'));assert.ok(!campus.includes('/opportunity/three/'));assert.ok(!campus.includes('external.example'));
  const other=await fs.readFile(path.join(out,'sitemap-source-other.xml'),'utf8');assert.ok(other.includes('/opportunity/three/'));assert.ok(!other.includes('/opportunity/one/'));
  const pages=await fs.readFile(path.join(out,'sitemap-pages.xml'),'utf8');assert.ok(pages.includes('/sources/'));assert.ok(!pages.includes('/opportunity/'));
  const files=[...index.matchAll(/<loc>https:\/\/example\.org\/project\/([^<]+)<\/loc>/g)].map(m=>m[1]);
  const urls=(await Promise.all(files.map(file=>fs.readFile(path.join(out,file),'utf8')))).flatMap(xml=>[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]));
  assert.equal(urls.length,routes.length);assert.equal(new Set(urls).size,routes.length);
  await assert.rejects(writeSitemaps({out,siteUrl:'https://example.org',routes:[],records}),/no generated detail page/);
 }finally{await fs.rm(out,{recursive:true,force:true});}
});
