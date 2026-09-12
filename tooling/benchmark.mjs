import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchCorpus } from '../runtime/search-docs.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const refs=path.join(root,'skill/suitecrm-expert-skill/references');
const original=JSON.parse(await readFile(path.join(root,'tests/fixtures/search-benchmark-8.json'),'utf8'));
const provenance=JSON.parse(await readFile(path.join(refs,'provenance.json'),'utf8'));
const cases=original.cases.map(c=>({...c,scope:provenance.files.find(f=>c.expectedPaths.includes(f.path))?.scope}));
const results=[];
for(const c of cases) {
  const found=await searchCorpus({referencesDir:refs,query:c.query,scope:c.scope,limit:10});
  const rank=found.findIndex(f=>c.expectedPaths.includes(f.referencePath))+1;
  const forbidden=(c.forbiddenPaths??[]).filter(p=>found.slice(0,3).some(f=>f.referencePath===p));
  const wrongScope=found.some(f=>f.scope!==c.scope);
  results.push({id:c.id,query:c.query,scope:c.scope,expectedPaths:c.expectedPaths,rank,forbidden,wrongScope,top3:found.slice(0,3).map(f=>f.referencePath)});
}
const report={method:'Scoped expected-path retrieval; rank is first labelled expected path; absent=0. Not a model behavior score.',cases:results.length,hitAt3:results.filter(r=>r.rank>0&&r.rank<=3).length/results.length,recallAt10:results.filter(r=>r.rank>0).length/results.length,mrr:results.reduce((s,r)=>s+(r.rank?1/r.rank:0),0)/results.length,results};
await mkdir(path.join(root,'tests/evidence'),{recursive:true});
await writeFile(path.join(root,'tests/evidence/retrieval.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({cases:report.cases,hitAt3:report.hitAt3,recallAt10:report.recallAt10,mrr:report.mrr}));
if(report.hitAt3!==1||report.recallAt10!==1||report.mrr<0.8||results.some(r=>r.forbidden.length||r.wrongScope)) process.exitCode=1;
