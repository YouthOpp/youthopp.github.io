import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {build,escapeHtml,safeUrl,paginate,mergeSourceDirectory} from '../scripts/build.mjs';
test('source escaping and safe schemes',()=>{assert.equal(escapeHtml('<script>"&'),'&lt;script&gt;&quot;&amp;');assert.equal(safeUrl('javascript:alert(1)'),'#');});
test('pagination bounds list pages',()=>assert.deepEqual(paginate(Array.from({length:61},(_,i)=>i),30).map(a=>a.length),[30,30,1]));
test('catalog pages preserve provenance, escape input and leave eligibility unknown',async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-'));const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');await fs.writeFile(input,JSON.stringify({schema_version:'1.0',opportunities:Array.from({length:31},(_,i)=>({id:`test-${i}`,title:'Example <script>alert(1)</script>',summary:'Fixture only',category:'scholarships',host_countries:['DE'],eligible_countries:[],source:'fixture',url:'https://example.org/real',language:'de',status:'unknown'})),sources:[{source:'fixture',name:'Fixture Publisher',website_url:'https://example.org'}]}));const result=await build({input,out});assert.equal(result.records,31);assert.ok(result.routes.includes('/countries/de/'));assert.ok(result.routes.includes('/opportunities/scholarships/page/2/'));const html=await fs.readFile(path.join(out,'opportunity/test-0/index.html'),'utf8');assert.ok(html.includes('https://example.org/real'));assert.ok(html.includes('Not provided — check the source'));assert.ok(html.includes('lang="de"'));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>alert'));const list=await fs.readFile(path.join(out,'opportunities/index.html'),'utf8');assert.equal((list.match(/class="opportunity"/g)||[]).length,30);assert.ok(list.includes('rel="canonical"'));await fs.rm(dir,{recursive:true,force:true});});

test('rejects unsupported catalog versions',async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-invalid-'));const input=path.join(dir,'catalog.json');await fs.writeFile(input,JSON.stringify({schema_version:999,opportunities:[{}],sources:[]}));await assert.rejects(()=>build({input,out:path.join(dir,'out')}),/Unsupported catalog schema/);await fs.rm(dir,{recursive:true,force:true});});
test('project Pages subpath prefixes every internal asset and navigation URL',async()=>{const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-subpath-'));const result=await build({out:dir,config:{url:'https://example.org/project/'}});const html=await fs.readFile(path.join(dir,'index.html'),'utf8');assert.ok(html.includes('href="/project/opportunities/"'));assert.ok(html.includes('src="/project/assets/logo.svg"'));assert.ok(html.includes('href="/project/assets/style.css"'));assert.ok(html.includes('https://example.org/project/'));assert.ok(!/\b(?:href|src)="\/(?!project\/)/.test(html));const sitemap=await fs.readFile(path.join(dir,'sitemap.xml'),'utf8');assert.ok(sitemap.includes('https://example.org/project/docs/'));assert.ok(result.routes.includes('/'));await fs.rm(dir,{recursive:true,force:true});});

test('project identity, catalog breadcrumbs and social metadata use the configured public endpoint',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-discovery-'));
 try{
  await build({out:dir,config:{url:'https://example.org/project',description:'A source-first <script>index</script>'}});
  const html=await fs.readFile(path.join(dir,'opportunities/scholarships/unknown/index.html'),'utf8');
  const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  const project=graph.find(n=>n['@type']==='Organization');const website=graph.find(n=>n['@type']==='WebSite');
  assert.equal(project.url,'https://example.org/project/');assert.equal(website.publisher['@id'],project['@id']);
  assert.equal(project.nonprofitStatus,undefined);
  const breadcrumbs=graph.find(n=>n['@type']==='BreadcrumbList').itemListElement;
  assert.deepEqual(breadcrumbs.map(n=>n.name),['Home','Opportunities','Scholarships','Scholarships — location not provided']);
  assert.deepEqual(breadcrumbs.map(n=>n.position),[1,2,3,4]);
  assert.ok(breadcrumbs.every(n=>n.item.startsWith('https://example.org/project/')));
  assert.ok(html.includes('name="twitter:image" content="https://example.org/project/assets/social-preview.png"'));
  assert.ok(html.includes('property="og:image:alt"'));assert.ok(html.includes('name="twitter:description"'));
  const doc=await fs.readFile(path.join(dir,'docs/ai-governance/index.html'),'utf8');
  const docGraph=JSON.parse(doc.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
  assert.equal(docGraph.find(n=>n['@type']==='BreadcrumbList').itemListElement[1].item,'https://example.org/project/docs/');
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('manual source review never appears as a successful automated collection',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-source-health-'));const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');
 try{
  await fs.writeFile(input,JSON.stringify({schema_version:1,opportunities:[],sources:[
   {source:'manual-fixture',name:'Recent manual candidate',website_url:'https://example.org/manual',status:'not_connected',last_check_at:'2026-10-04T18:00:00Z'},
   {source:'connected-fixture',name:'Connected source fixture',website_url:'https://example.org/connected',status:'ok',last_success_at:'2026-10-03T18:00:00Z',last_check_at:'2026-10-04T18:00:00Z'}
  ]}));
  await build({input,out});
  const html=await fs.readFile(path.join(out,'sources/index.html'),'utf8');
  const cards=[...html.matchAll(/<article class="source-card">([\s\S]*?)<\/article>/g)].map(m=>m[1]);
  const candidate=cards.find(card=>card.includes('<h2>Recent manual candidate</h2>'));
  assert.ok(candidate.includes('Source status: not_connected · Last collection success: Not provided'));
  assert.ok(candidate.includes('Last reviewed/checked: 2026-10-04'));
  assert.ok(!candidate.includes('Last collection success: 2026-10-04'));
  const connected=cards.find(card=>card.includes('<h2>Connected source fixture</h2>'));
  assert.ok(connected.includes('Last collection success: 2026-10-03'));
  assert.ok(connected.includes('Last reviewed/checked: 2026-10-04'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});


test('source directory merges equivalent publisher homepages without replacing runtime health or distinct pages',()=>{
 const runtime={source:'opportunitiesforyouth',website_url:'https://OpportunitiesForYouth.org',status:'error',last_success_at:'2026-10-03T18:00:00Z',last_check_at:'2026-10-04T18:00:00Z',error:'Latest fetch failed',adapter:'rss'};
 const research=[
  {id:'opportunities-for-youth',url:'https://opportunitiesforyouth.org/',name:'Opportunities for Youth',description:'Reviewed publisher',acquisition_state:'not_connected',status:'candidate',adapter_status:'integration_candidate',last_success_at:'2026-10-04T19:00:00Z',verified_at:'2026-10-04',rights_review_status:'pending'},
  {id:'same-host-other-programme',url:'https://opportunitiesforyouth.org/programmes/',name:'Separate programme page',acquisition_state:'not_connected'},
  {id:'invalid-homepage',url:'javascript:alert(1)',name:'Invalid homepage candidate'}
 ];
 const {sources,directory}=mergeSourceDirectory([runtime],research);
 assert.equal(directory.length,3);assert.equal(sources[0].source,'opportunitiesforyouth');assert.equal(sources[0].id,'opportunitiesforyouth');
 assert.equal(sources[0].name,'Opportunities for Youth');assert.equal(sources[0].description,'Reviewed publisher');assert.equal(sources[0].rights_review_status,'pending');
 assert.equal(sources[0].status,'error');assert.equal(sources[0].acquisition_state,'error');assert.equal(sources[0].last_success_at,runtime.last_success_at);assert.equal(sources[0].error,'Latest fetch failed');assert.equal(sources[0].adapter_status,undefined);
 assert.ok(directory.includes(research[1]));assert.ok(directory.includes(research[2]));assert.ok(!directory.includes(research[0]));
 assert.equal(mergeSourceDirectory([{source:'invalid-runtime',website_url:'javascript:nope'}],research).directory.length,4);
 const noSuccess=mergeSourceDirectory([{source:'opportunitiesforyouth',website_url:runtime.website_url,status:'ok'}],research).sources[0];assert.equal(noSuccess.last_success_at,null);
});


test('programme and institutional records show accurate kind notices on catalog cards and detail pages',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-record-kind-'));const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');
 try{
  const base={summary:'',host_countries:[],eligible_countries:[],source:'fixture',url:'https://example.org/information',language:'cs',status:'unknown',deadline:null};
  await fs.writeFile(input,JSON.stringify({schema_version:1,sources:[],opportunities:[
   {...base,id:'programme',title:'Programme fixture',category:'scholarships',tags:['programme-overview']},
   {...base,id:'institutional',title:'Institutional fixture',category:'grants',tags:['institutional-grant']},
   {...base,id:'regular',title:'Regular fixture',summary:'Original listing summary',category:'scholarships',tags:[]}
  ]}));
  await build({input,out});const catalog=await fs.readFile(path.join(out,'opportunities/index.html'),'utf8');
  assert.ok(catalog.includes('<span class="tag">Programme overview</span>'));assert.ok(catalog.includes('<span class="tag">Institutional grant</span>'));
  assert.ok(catalog.includes('Confirm current application calls and dates with the publisher.'));
  assert.ok(catalog.includes('Funding for institutions or organisations.'));
  const programme=await fs.readFile(path.join(out,'opportunity/programme/index.html'),'utf8');
  const institutional=await fs.readFile(path.join(out,'opportunity/institutional/index.html'),'utf8');
  const regular=await fs.readFile(path.join(out,'opportunity/regular/index.html'),'utf8');
  assert.ok(programme.includes('<span class="tag">Programme overview</span>'));assert.ok(programme.includes('View programme information ↗'));
  assert.ok(institutional.includes('<span class="tag">Institutional grant</span>'));assert.ok(institutional.includes('View institutional grant details ↗'));
  for(const [html,description] of [[programme,'Programme information. Confirm current application calls and dates with the publisher.'],[institutional,'Funding for institutions or organisations. Confirm eligible applicants and current calls with the publisher.']]){
   assert.ok(html.includes(`<meta name="description" content="${description}">`));
   assert.ok(html.includes(`<meta property="og:description" content="${description}">`));
   assert.ok(html.includes(`<meta name="twitter:description" content="${description}">`));
   const graph=JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])['@graph'];
   assert.equal(graph.find(node=>node['@type']==='WebPage').description,description);
  }
  assert.ok(regular.includes('Read the original &amp; apply ↗'));assert.ok(!regular.includes('Programme overview'));assert.ok(!regular.includes('Institutional grant'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('additive v1 taxonomy supplies category labels without removing existing routes',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-taxonomy-'));const input=path.join(dir,'catalog.json');
 try {
  await fs.writeFile(input,JSON.stringify({schema_version:1,opportunities:[],sources:[],taxonomy:{categories:[{id:'internships',label:'Work placements'},{id:'scholarships',label:'Study funding'}]}}));
  const result=await build({input,out:path.join(dir,'out')});
  assert.ok(result.routes.includes('/opportunities/jobs/'));
  const home=await fs.readFile(path.join(dir,'out/index.html'),'utf8');
  assert.ok(home.includes('Work placements'));
  assert.ok(home.indexOf('Work placements')<home.indexOf('Study funding'));
  assert.ok(home.includes('Search and country filter apply to the latest listings'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('embedded source registry is authoritative and keeps runtime health separate',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-embedded-sources-'));const input=path.join(dir,'catalog.json');
 try {
  await fs.writeFile(input,JSON.stringify({schema_version:1,opportunities:[],sources:[{source:'adapter-one',name:'Runtime publisher',website_url:'https://example.org/',status:'error',last_success_at:null,error:'Collection failed'}],source_registry:[{id:'review-one',adapter_source_id:'adapter-one',name:'Research publisher',url:'https://example.org/',publisher_country:'DE',categories:['internships'],verified_at:'2026-10-05',acquisition_state:'not_connected',rights_review_status:'pending'}]}));
  await build({input,out:path.join(dir,'out')});
  const html=await fs.readFile(path.join(dir,'out/sources/index.html'),'utf8');
  assert.equal((html.match(/<article class="source-card">/g)||[]).length,1);
  assert.ok(html.includes('Source status: error · Last collection success: Not provided'));
  assert.ok(html.includes('Germany'));assert.ok(html.includes('Content: Internships'));
  assert.ok(!html.includes('grants.at'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('multi-category records appear once in every relevant category and country listing',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-multi-category-'));const input=path.join(dir,'catalog.json');
 try{
  await fs.writeFile(input,JSON.stringify({schema_version:1,sources:[],opportunities:[{id:'multi-record',title:'Combined opportunity',summary:'Discovery record',url:'https://example.org/programme',category:'scholarships',categories:['scholarships','training','training'],host_countries:['DE'],eligible_countries:[],status:'unknown'}]}));
  const result=await build({input,out:path.join(dir,'out')});assert.equal(result.records,1);
  for(const route of ['opportunities/scholarships','opportunities/training','opportunities/training/de']){
   const html=await fs.readFile(path.join(dir,'out',route,'index.html'),'utf8');assert.equal((html.match(/class="opportunity"/g)||[]).length,1);
  }
  const unrelated=await fs.readFile(path.join(dir,'out/opportunities/jobs/index.html'),'utf8');assert.ok(!unrelated.includes('Combined opportunity'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('runtime publisher merges every equivalent research alias while retaining distinct pages',()=>{
 const result=mergeSourceDirectory([{source:'adapter',website_url:'https://example.org/',status:'ok'}],[{id:'review',name:'Reviewed publisher',url:'https://example.org/'},{id:'adapter',url:'https://example.org/'},{id:'programme',name:'Distinct programme',url:'https://example.org/programme'}]);
 assert.equal(result.directory.length,2);assert.equal(result.sources[0].name,'Reviewed publisher');assert.equal(result.sources[0].acquisition_state,'ok');assert.equal(result.directory[1].id,'programme');
});


test('canonical record kinds override legacy tags and preserve information-only application actions',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-canonical-kind-'));const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');
 try{
  const base={summary:'',category:'scholarships',host_countries:[],eligible_countries:[],source:'fixture',url:'https://example.org/information',status:'unknown'};
  await fs.writeFile(input,JSON.stringify({schema_version:1,model_version:2,sources:[],opportunities:[
   {...base,id:'programme-kind',title:'Programme kind only',kind:'programme-overview',tags:[]},
   {...base,id:'institutional-kind',title:'Institutional kind only',kind:'institutional-grant',category:'grants',tags:[]},
   {...base,id:'programme-conflict',title:'Programme wins conflicting tag',kind:'programme-overview',tags:['institutional-grant']},
   {...base,id:'institutional-conflict',title:'Institutional wins conflicting tag',kind:'institutional-grant',category:'grants',tags:['programme-overview']},
   {...base,id:'opportunity-conflict',title:'Opportunity wins conflicting tags',kind:'opportunity',tags:['programme-overview','institutional-grant']},
   {...base,id:'unknown-conflict',title:'Unknown wins conflicting tags',kind:'unknown',tags:['programme-overview','institutional-grant']}
  ]}));
  await build({input,out});
  const listing=await fs.readFile(path.join(out,'opportunities/index.html'),'utf8');
  for(const [id,label,action,description] of [
   ['programme-kind','Programme overview','View programme information ↗','Programme information. Confirm current application calls and dates with the publisher.'],
   ['programme-conflict','Programme overview','View programme information ↗','Programme information. Confirm current application calls and dates with the publisher.'],
   ['institutional-kind','Institutional grant','View institutional grant details ↗','Funding for institutions or organisations. Confirm eligible applicants and current calls with the publisher.'],
   ['institutional-conflict','Institutional grant','View institutional grant details ↗','Funding for institutions or organisations. Confirm eligible applicants and current calls with the publisher.']
  ]){
   const row=(listing.match(/<tr class="opportunity"[^>]*>[\s\S]*?<\/tr>/g)||[]).find(row=>row.includes('/opportunity/'+id+'/"'));
   assert.ok(row?.includes('<span class="tag">'+label+'</span>'),id+' listing kind');
   const html=await fs.readFile(path.join(out,'opportunity',id,'index.html'),'utf8');
   assert.ok(html.includes('<span class="tag">'+label+'</span>'),id+' detail kind');
   assert.ok(html.includes(action),id+' information action');
   assert.ok(!html.includes('Read the original &amp; apply'),id+' never implies an application');
   assert.ok(!html.includes('<span class="tag">'+(label==='Programme overview'?'Institutional grant':'Programme overview')+'</span>'),id+' ignores conflicting tag');
   for(const meta of ['<meta name="description"','<meta property="og:description"','<meta name="twitter:description"'])assert.ok(html.includes(meta+' content="'+description+'">'),id+' metadata description');
  }
  for(const id of ['opportunity-conflict','unknown-conflict']){
   const html=await fs.readFile(path.join(out,'opportunity',id,'index.html'),'utf8');
   assert.ok(html.includes(id==='unknown-conflict'?'Visit the original source ↗':'Read the original &amp; apply ↗'),id+' accurate discovery action');
   if(id==='unknown-conflict'){assert.ok(html.includes('Indexed source page'));assert.ok(!html.includes('Read the original &amp; apply'));}
   assert.ok(!html.includes('Programme overview'));assert.ok(!html.includes('Institutional grant'));
   const row=(listing.match(/<tr class="opportunity"[^>]*>[\s\S]*?<\/tr>/g)||[]).find(row=>row.includes('/opportunity/'+id+'/"'));
   assert.ok(row);assert.ok(!row.includes('Programme overview'));assert.ok(!row.includes('Institutional grant'));
  }
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('production presents pipeline-owned registry and contributors and refuses absent contract',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-producer-contract-'));const input=path.join(dir,'catalog.json');const contributorsInput=path.join(dir,'contributors.json');const out=path.join(dir,'site');
 const catalog={schema_version:1,opportunities:[],sources:[],source_registry:[{id:'release-only',name:'Release registry publisher',url:'https://example.org/release',acquisition_state:'not_connected'}]};
 const contributorData={generated_at:'2026-10-05T07:00:00Z',status:'partial',mapping_errors:[{error:'Fixture mapping warning'}],unresolved_commits:2,contributors:[{login:'fixture-person',name:'Release contributor',score:4,commits:4}]};
 try{
  await fs.writeFile(input,JSON.stringify(catalog));
  await assert.rejects(()=>build({input,out,requireCatalog:true}),/pipeline contributor snapshot is required/);
  await fs.writeFile(contributorsInput,JSON.stringify(contributorData));await build({input,out,requireCatalog:true});
  const html=await fs.readFile(path.join(out,'contributors/index.html'),'utf8');assert.ok(html.includes('Release contributor'));assert.ok(html.includes('4 contribution points'));assert.ok(html.includes('Collection status: partial'));assert.ok(html.includes('Unresolved identities: 2'));
  const sources=await fs.readFile(path.join(out,'sources/index.html'),'utf8');assert.ok(sources.includes('Release registry publisher'));
  await fs.writeFile(input,JSON.stringify({...catalog,source_registry:undefined}));await assert.rejects(()=>build({input,out,requireCatalog:true}),/pipeline source registry is required/);
  await fs.writeFile(input,JSON.stringify(catalog));await fs.writeFile(contributorsInput,JSON.stringify({...contributorData,contributors:[{login:'bad',score:'4',commits:4}]}));await assert.rejects(()=>build({input,out,requireCatalog:true}),/Invalid pipeline contributor record/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('publisher attribution is escaped wherever source titles appear without inventing missing notices',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-attribution-'));const input=path.join(dir,'catalog.json');const out=path.join(dir,'site');
 const base={title:'Programme fixture',summary:'',category:'scholarships',host_countries:[],eligible_countries:[],url:'https://example.org/programme',language:'en',status:'unknown'};
 try{
  await fs.writeFile(input,JSON.stringify({schema_version:1,source_registry:[],sources:[{source:'credited',name:'OeAD',website_url:'https://example.org/credited',attribution:'© OeAD <script>alert(1)</script>'},{source:'ordinary',name:'Ordinary publisher',website_url:'https://example.org/ordinary'}],opportunities:[{...base,id:'credited-record',source:'credited'},{...base,id:'ordinary-record',source:'ordinary'}]}));
  await build({input,out});const sources=await fs.readFile(path.join(out,'sources/index.html'),'utf8');const detail=await fs.readFile(path.join(out,'opportunity/credited-record/index.html'),'utf8');
  const listingRoutes=['index.html','opportunities/index.html','opportunities/scholarships/index.html','countries/unknown/index.html','opportunities/scholarships/unknown/index.html'];
  const listings=await Promise.all(listingRoutes.map(route=>fs.readFile(path.join(out,route),'utf8')));
  for(const html of [sources,detail,...listings]){assert.ok(html.includes('Source attribution: © OeAD &lt;script&gt;alert(1)&lt;/script&gt;'));assert.ok(!html.includes('<script>alert(1)</script>'));}
  for(const html of listings){const ordinaryRow=(html.match(/<tr class="opportunity"[^>]*>[\s\S]*?<\/tr>/g)||[]).find(row=>row.includes('/opportunity/ordinary-record/'));assert.ok(ordinaryRow);assert.ok(!ordinaryRow.includes('source-attribution'));}
  const ordinary=await fs.readFile(path.join(out,'opportunity/ordinary-record/index.html'),'utf8');assert.ok(!ordinary.includes('source-attribution'));assert.equal((sources.match(/class="small source-attribution"/g)||[]).length,1);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

test('source removal guidance is routed from every footer and the documentation index',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-source-removal-'));
 try{
  const result=await build({out:dir,config:{url:'https://example.org/project/'}});
  assert.ok(result.routes.includes('/docs/source-removal/'));
  const footerText='To request removal of a source or indexed link, open an issue or submit a pull request.';
  for(const route of ['index.html','sources/index.html','docs/privacy/index.html','docs/source-removal/index.html']){
   const html=await fs.readFile(path.join(dir,route),'utf8');
   assert.ok(html.includes(`<a href="/project/docs/source-removal/">${footerText}</a>`),route);
   assert.equal((html.match(new RegExp(footerText.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'g'))||[]).length,1,route);
   assert.ok(html.includes('independent search index of factual titles and links'),route);
   assert.ok(html.includes('Indexing does not imply publisher endorsement'),route);
  }
  const docs=await fs.readFile(path.join(dir,'docs/index.html'),'utf8');
  assert.ok(docs.includes('href="/project/docs/source-removal/"'));
  assert.ok(docs.includes('<h2>Source removal requests</h2>'));
  const removal=await fs.readFile(path.join(dir,'docs/source-removal/index.html'),'utf8');
  assert.ok(removal.includes('href="https://github.com/YouthOpp/data-pipeline/issues/new"'));
  assert.ok(removal.includes('href="https://github.com/YouthOpp/data-pipeline/pulls"'));
  assert.ok(removal.includes('<code>data/sources/sources.json</code>'));
  assert.ok(removal.includes('<code>enabled: false</code>'));
  assert.ok(removal.includes('Do not include personal, confidential or sensitive information'));
  const privacy=await fs.readFile(path.join(dir,'docs/privacy/index.html'),'utf8');
  assert.ok(privacy.includes('href="/project/docs/source-removal/"'));
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});

 test('central settings drive shared branding and canonical discovery on every route',async()=>{
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'youthopp-settings-'));const out=path.join(dir,'site');
 try{
  const result=await build({out,config:{title:'Shared <brand>',tagline:'Shared tagline',brandCaption:'Shared caption',mission:'Shared mission',repositoryUrl:'https://github.com/example/project',googleAnalyticsId:'G-EXAMPLE123',googleVerification:'google-token',bingVerification:'bing-token'}});
  for(const route of result.routes){const html=await fs.readFile(path.join(out,route,'index.html'),'utf8');
   assert.ok(html.includes('content="https://youthopps.org'+route+'"'));
   assert.ok(html.includes('<span>Shared &lt;brand&gt;</span>'));assert.ok(html.includes('Shared tagline'));assert.ok(html.includes('Shared caption'));assert.ok(html.includes('Shared mission'));
   assert.ok(html.includes('href="https://github.com/example/project"'));assert.ok(html.includes('data-id="G-EXAMPLE123"'));
   assert.ok(html.includes('name="google-site-verification" content="google-token"'));assert.ok(html.includes('name="msvalidate.01" content="bing-token"'));
   const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);assert.equal(graph['@graph'][0].name,'Shared <brand>');assert.equal(graph['@graph'][1].name,'Shared <brand>');
  }
  for(const file of ['robots.txt','sitemap.xml','llms.txt']){const text=await fs.readFile(path.join(out,file),'utf8');assert.ok(text.includes('https://youthopps.org'));assert.ok(!text.includes('fmarslan.github.io'));}
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
