import fs from 'node:fs/promises';
import path from 'node:path';

// Tests create only the per-source input files consumed by production builds.
export async function writeSources(input,{opportunities=[],sources=[]}={}) {
 await fs.mkdir(input,{recursive:true});
 const ids=new Set([...sources.map(s=>s.source),...opportunities.map(o=>o.source||'fixture')]);
 for(const source of ids){
  const metadata={status:'success',...(sources.find(s=>s.source===source)||{}),source};
  const records=opportunities.filter(o=>(o.source||'fixture')===source).map(o=>({...o,source}));
  const dir=path.join(input,source);await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'data.json'),JSON.stringify(records));
  await fs.writeFile(path.join(dir,'metadata.json'),JSON.stringify(metadata));
 }
 return input;
}
