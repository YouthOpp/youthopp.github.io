import fs from 'node:fs/promises';
import path from 'node:path';
const out=process.argv[2]||'dist';
const catalog=JSON.parse(await fs.readFile(process.env.CATALOG_PATH||'data/catalog.json','utf8'));
const report=JSON.parse(await fs.readFile(path.join(out,'build-report.json'),'utf8'));
const records=catalog.opportunities.filter(r=>r.status!=='expired');
if(report.records.length!==records.length||new Set(report.records.map(r=>r.id)).size!==records.length)throw Error('Build lost or duplicated catalog records');
for(const record of records){
 if(!report.records.some(r=>r.id===record.id))throw Error('Missing rendered record');
 const html=await fs.readFile(path.join(out,'opportunity',record.id,'index.html'),'utf8');
 if(!html.includes('row-title')&&!html.includes('page-title'))throw Error('Empty opportunity detail');
}
for(const route of report.routes)await fs.access(path.join(out,route,'index.html'));
for(const country of [...new Set(report.records.filter(r=>r.kind!=='unknown').map(r=>r.publisher_country).filter(Boolean))]){
 const route=`/opportunities/from/${country.toLowerCase()}/`;
 if(!report.routes.includes(route))throw Error('Missing publisher country record collection');
 const html=await fs.readFile(path.join(out,route,'index.html'),'utf8');
 if(!html.includes('class="opportunity"'))throw Error('Country page contains no record rows');
}
console.log(JSON.stringify({records:records.length,routes:report.routes.length,countryCollections:'verified',generated_at:report.generated_at}));
