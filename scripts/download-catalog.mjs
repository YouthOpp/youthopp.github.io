import {createHash} from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateContributorData} from './build.mjs';

export async function downloadReleaseAsset(repository,tag,asset,dest){
 const url=`https://github.com/${repository}/releases/download/${encodeURIComponent(tag)}/${encodeURIComponent(asset)}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw new Error(`Release asset ${asset} unavailable (HTTP ${response.status})`);
 const bytes=Buffer.from(await response.arrayBuffer());
 await fs.writeFile(path.join(dest,asset),bytes);
}

export function validateManifest(manifest, assetName='catalog.json'){
 if(manifest?.schema_version!==1||!/^catalog-\d+-\d+$/.test(manifest?.release_tag||''))throw new Error('Invalid catalog manifest version or immutable release tag');
 const asset=manifest.assets?.[assetName];
 if(!asset||!/^[a-f0-9]{64}$/.test(asset.sha256||'')||!Number.isSafeInteger(asset.size)||asset.size<1)throw new Error(`Invalid ${assetName} manifest integrity metadata`);
 return {releaseTag:manifest.release_tag,sha256:asset.sha256,size:asset.size};
}
export function verifyCatalog(bytes,manifest,assetName='catalog.json'){
 const asset=validateManifest(manifest,assetName);
 if(bytes.length!==asset.size)throw new Error('Catalog byte-size mismatch');
 if(createHash('sha256').update(bytes).digest('hex')!==asset.sha256)throw new Error('Catalog SHA-256 mismatch');
 return asset;
}
export async function downloadSourceSnapshot({repository,commit,out,contributorsOut,request=fetch}){
 if(repository!=='YouthOpps/data-source'||!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid pinned data-source revision');
 const response=await request(`https://raw.githubusercontent.com/${repository}/${commit}/catalog.json`,{signal:AbortSignal.timeout(60000)});
 if(!response.ok)throw Error(`Pinned data-source catalog unavailable (HTTP ${response.status})`);
 const bytes=Buffer.from(await response.arrayBuffer());
 if(bytes.length>15000000)throw Error('Source catalog exceeds size limit');
 const catalog=JSON.parse(bytes);
 if(catalog.schema_version!==1||!Array.isArray(catalog.opportunities)||!Array.isArray(catalog.sources)||!Array.isArray(catalog.source_registry))throw Error('Invalid data-source catalog');
 const contributors={generated_at:new Date().toISOString(),status:'partial',contributors:[]};
 validateContributorData(contributors);
 await fs.mkdir(path.dirname(out),{recursive:true});
 await fs.mkdir(path.dirname(contributorsOut),{recursive:true});
 await fs.writeFile(out,bytes);
 await fs.writeFile(contributorsOut,JSON.stringify(contributors));
 return {commit,bytes:bytes.length};
}

export async function downloadCatalog({repository=process.env.DATA_REPOSITORY||'YouthOpps/data-pipeline',out='data/catalog.json',contributorsOut=path.join(path.dirname(out),'contributors.json'),pointer=path.join(path.dirname(fileURLToPath(import.meta.url)),'../catalog-release.json'),download}={}){
 if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository))throw new Error('Invalid data repository');
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-release-'));
 const fetchAsset=download||((tag,asset,dest)=>downloadReleaseAsset(repository,tag,asset,dest));
 try{
  let releasePointer;
  try{releasePointer=JSON.parse(await fs.readFile(pointer,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(releasePointer?.schema_version===2){
   if(releasePointer.repository!=='YouthOpps/data-source'||!/^[a-f0-9]{40}$/.test(releasePointer.commit_sha||''))throw Error('Invalid pinned data-source pointer');
   return await downloadSourceSnapshot({repository:releasePointer.repository,commit:releasePointer.commit_sha,out,contributorsOut});
  }
  // Continue serving the last verified release until the first source commit.
  if(releasePointer?.schema_version===1&&repository==='YouthOpps/data-source')repository=releasePointer.repository;
  if(releasePointer&&(releasePointer.schema_version!==1||releasePointer.repository!==repository||!/^catalog-\d+-\d+$/.test(releasePointer.release_tag)||!/^[a-f0-9]{64}$/.test(releasePointer.manifest_sha256)))throw new Error('Invalid catalog release pointer');
  await fetchAsset(releasePointer?.release_tag||'catalog-latest','manifest.json',dir);
  const manifestBytes=await fs.readFile(path.join(dir,'manifest.json'));
  if(releasePointer&&createHash('sha256').update(manifestBytes).digest('hex')!==releasePointer.manifest_sha256)throw new Error('Release manifest SHA-256 mismatch');
  const manifest=JSON.parse(manifestBytes);
  const {releaseTag}=validateManifest(manifest);
  if(releasePointer&&releaseTag!==releasePointer.release_tag)throw new Error('Release pointer does not match manifest');
  validateManifest(manifest,'contributors.json');
  await fetchAsset(releaseTag,'catalog.json',dir);
  const bytes=await fs.readFile(path.join(dir,'catalog.json'));
  verifyCatalog(bytes,manifest);
  await fetchAsset(releaseTag,'contributors.json',dir);
  const contributorBytes=await fs.readFile(path.join(dir,'contributors.json'));
  verifyCatalog(contributorBytes,manifest,'contributors.json');
  const contributorData=JSON.parse(contributorBytes);
  validateContributorData(contributorData);
  const catalog=JSON.parse(bytes);
  if(!Array.isArray(catalog.source_registry))throw new Error('A pipeline source registry is required');
  await fs.mkdir(path.dirname(contributorsOut),{recursive:true});
  await fs.writeFile(contributorsOut,contributorBytes);
  await fs.mkdir(path.dirname(out),{recursive:true});await fs.writeFile(out,bytes);
  console.log(`Verified ${bytes.length} catalog bytes and ${contributorBytes.length} contributor bytes from ${repository}@${releaseTag}`);
  return {releaseTag,bytes:bytes.length};
 }finally{await fs.rm(dir,{recursive:true,force:true});}
}
if(process.argv[1]===fileURLToPath(import.meta.url))await downloadCatalog();

