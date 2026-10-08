import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';

const escapeXml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const namespace='http://www.sitemaps.org/schemas/sitemap/0.9';
const header='<?xml version="1.0" encoding="UTF-8"?>\n';

export async function writeSitemaps({out,siteUrl,routes,records}){
 const available=new Set(routes);
 const groups=new Map();
 const detailRoutes=new Set();
 for(const record of records){
  const route=`/opportunity/${record.id}/`;
  if(!available.has(route))throw Error('Sitemap record has no generated detail page');
  const source=String(record.source||'unknown');
  if(!groups.has(source))groups.set(source,[]);
  groups.get(source).push(route);detailRoutes.add(route);
 }
 const files=[];
 async function writeGroup(name,items){
  // Keep each child below the sitemap protocol's 50,000 URL limit.
  for(let start=0;start<items.length;start+=45000){
   const suffix=items.length>45000?`-${Math.floor(start/45000)+1}`:'';
   const filename=`${name}${suffix}.xml`;
   const entries=items.slice(start,start+45000).map(route=>`  <url><loc>${escapeXml(siteUrl+route)}</loc></url>`).join('\n');
   await fs.writeFile(path.join(out,filename),`${header}<urlset xmlns="${namespace}">\n${entries}\n</urlset>\n`);
   files.push(filename);
  }
 }
 await writeGroup('sitemap-pages',routes.filter(route=>!detailRoutes.has(route)));
 for(const [source,items] of [...groups].sort(([a],[b])=>a.localeCompare(b))){
  const key=/^[a-z0-9-]+$/.test(source)?source:`${source.toLowerCase().replace(/[^a-z0-9-]/g,'-').slice(0,80)}-${createHash('sha256').update(source).digest('hex').slice(0,12)}`;
  await writeGroup(`sitemap-source-${key}`,items);
 }
 const entries=files.map(file=>`  <sitemap><loc>${escapeXml(siteUrl+'/'+file)}</loc></sitemap>`).join('\n');
 await fs.writeFile(path.join(out,'sitemap.xml'),`${header}<sitemapindex xmlns="${namespace}">\n${entries}\n</sitemapindex>\n`);
 return files;
}
