import { cp, lstat, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { buildZip, readZip } from './lib/zip.mjs';
export const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const name='suitecrm-expert-skill';
export const skill=path.join(root,'skill',name);
export const hash=b=>createHash('sha256').update(b).digest('hex');
export function validateDocumentIdentity(doc,knownSources) {
  assert(['suitecrm-8','shared-api-v8','legacy-in-8','current-online'].includes(doc.scope),'Unknown document scope');
  assert(typeof doc.sourceId==='string'&&knownSources.has(doc.sourceId),'Unknown source identity');
  assert(doc.path.startsWith('official/content/'),'Standalone legacy corpus is excluded');
  assert.equal(doc.sourceId,'suitedocs-8','Only pinned 8.x/shared sources are permitted');
  if(doc.scope==='legacy-in-8') assert(doc.legacyEvidence?.path?.startsWith('official/content/8.x/') && /^[a-f0-9]{64}$/.test(doc.legacyEvidence.sha256),'Retained legacy requires 8.x evidence');
}
export async function files(dir,relative='') {
  const output=[];
  for(const entry of await readdir(path.join(dir,relative),{withFileTypes:true})) {
    const rel=path.posix.join(relative,entry.name), info=await lstat(path.join(dir,rel));
    if(info.isSymbolicLink()) throw Error('Links are not packaged: '+rel);
    if(info.isDirectory()) output.push(...await files(dir,rel));
    else if(info.isFile()) output.push(rel);
    else throw Error('Non-regular file: '+rel);
  }
  return output.sort();
}
export async function validateSource() {
  const paths=await files(skill);
  const text=await readFile(path.join(skill,'SKILL.md'),'utf8');
  assert.match(text,/^---\nname: suitecrm-expert-skill\ndescription:/);
  assert(text.length<14000,'Entrypoint too large');
  assert(!paths.some(p=>/^(scripts|actions)\//.test(p)),'Canonical OpenAI tree must be instruction-only');
  const refs=path.join(skill,'references');
  const provenance=JSON.parse(await readFile(path.join(refs,'provenance.json'),'utf8'));
  const knownSources=new Set(provenance.sources.map(s=>s.id));
  assert.deepEqual([...knownSources],['suitedocs-8'],'Standalone legacy source is excluded');
  const seen=new Set();
  for(const doc of provenance.files) {
    assert(doc.path.startsWith('official/')&&!doc.path.split('/').some(p=>p==='..'||p==='.'||!p)&&!doc.path.includes('\\'),'Unsafe provenance path');
    assert(!seen.has(doc.path),'Duplicate document'); seen.add(doc.path);
    validateDocumentIdentity(doc,knownSources);
    if(doc.scope==='legacy-in-8') {
      const evidence=provenance.files.find(f=>f.path===doc.legacyEvidence.path);
      assert(evidence?.scope==='suitecrm-8'&&evidence.sourceId===doc.sourceId,'Missing release-matched 8.x evidence');
      assert.equal(evidence.sha256,doc.legacyEvidence.sha256,'Legacy evidence hash mismatch');
    }
    assert(new URL(doc.officialUrl).hostname==='docs.suitecrm.com','Unexpected official host');
    assert.equal(hash(await readFile(path.join(refs,doc.path))),doc.sha256,doc.path);
  }
  const actual=(await files(path.join(refs,'official'))).map(p=>'official/'+p);
  assert.deepEqual(actual.sort(),[...seen].sort(),'Untracked or missing official document');
  for(const rel of paths.filter(p=>p.endsWith('.md')&&!p.startsWith('references/official/'))) {
    const body=await readFile(path.join(skill,rel),'utf8');
    for(const m of body.matchAll(/\[[^\]\n]*\]\(([^)\n]+)\)/g)) {
      const url=m[1]; if(/^(https?:|#)/.test(url)) continue;
      const target=path.resolve(path.dirname(path.join(skill,rel)),decodeURIComponent(url.split('#')[0]));
      const local=path.relative(skill,target);
      assert(!local.startsWith('..')&&!path.isAbsolute(local),'Link escapes skill: '+rel);
      assert((await lstat(target)).isFile(),`Missing link ${rel}: ${url}`);
    }
  }
  return {files:paths.length,officialDocuments:seen.size};
}
export async function expected(variant) {
  const map=new Map();
  for(const p of await files(skill)) map.set(`${name}/${p}`,await readFile(path.join(skill,p)));
  if(variant==='opencode') for(const p of await files(path.join(root,'runtime'))) map.set(`${name}/scripts/${p}`,await readFile(path.join(root,'runtime',p)));
  return map;
}
export async function validateArchive(zip,variant) {
  assert(['openai','opencode'].includes(variant));
  const archive=await readZip(zip,{maxFiles:500});
  const wanted=await expected(variant);
  assert.equal(archive.rootName,name);
  assert.equal(archive.entries.length,wanted.size);
  for(const e of archive.entries) {
    assert(wanted.has(e.name),`Unexpected archive entry: ${e.name}`);
    assert(e.data.equals(wanted.get(e.name)),`Archive mismatch: ${e.name}`);
  }
  return archive;
}
export async function build() {
  const validation=await validateSource();
  const dist=path.join(root,'dist'); await mkdir(dist,{recursive:true});
  const temp=await mkdtemp(path.join(dist,'.build-'));
  try {
    const stage=path.join(temp,name); await cp(skill,stage,{recursive:true});
    const manifests={};
    for(const variant of ['openai','opencode']) {
      if(variant==='opencode') await cp(path.join(root,'runtime'),path.join(stage,'scripts'),{recursive:true});
      const outputFile=path.join(dist,`${name}-${variant}.zip`);
      const report=await buildZip({sourceDir:stage,outputFile,rootName:name});
      const repeat=await buildZip({sourceDir:stage,outputFile:path.join(temp,'repeat.zip'),rootName:name});
      assert.equal(report.sha256,repeat.sha256,'Build is not deterministic');
      await validateArchive(outputFile,variant);
      const wanted=await expected(variant);
      manifests[variant]={...report,archive:path.basename(outputFile),files:Object.fromEntries([...wanted].map(([p,b])=>[p,hash(b)]))};
    }
    const info=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
    const manifest={name,version:info.version,validation,buildPolicy:'Offline; fixed ZIP timestamps; byte-for-byte source parity; no inherited test scores',variants:manifests};
    await writeFile(path.join(dist,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
    console.log(JSON.stringify({validation,variants:Object.fromEntries(Object.entries(manifests).map(([k,v])=>[k,{sha256:v.sha256,fileCount:v.fileCount,bytes:v.compressedSize}]))}));
    return manifest;
  } finally {
    const relative=path.relative(dist,temp);
    assert(relative.startsWith('.build-')&&!relative.includes(path.sep)&&path.isAbsolute(temp),'Unsafe temporary cleanup');
    await rm(temp,{recursive:true,force:true});
  }
}
export async function validateBuilt() {
  const source=await validateSource();
  const manifest=JSON.parse(await readFile(path.join(root,'dist/manifest.json'),'utf8'));
  for(const variant of ['openai','opencode']) {
    const file=path.join(root,'dist',`${name}-${variant}.zip`);
    const archive=await validateArchive(file,variant);
    assert.equal(hash(await readFile(file)),manifest.variants[variant].sha256);
    assert.equal(archive.fileCount,manifest.variants[variant].fileCount);
    const wanted=await expected(variant);
    assert.deepEqual(Object.fromEntries([...wanted].map(([p,b])=>[p,hash(b)])),manifest.variants[variant].files);
  }
  console.log(JSON.stringify({status:'PASS',...source,archives:2}));
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try { if(process.argv[2]==='build') await build(); else if(process.argv[2]==='validate') await validateBuilt(); else throw Error('Use build or validate'); }
  catch(e) { console.error(e.stack); process.exitCode=1; }
}
