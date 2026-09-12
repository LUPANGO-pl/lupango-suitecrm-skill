import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, cp, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { inspect } from '../runtime/inspect-suitecrm.mjs';
import { searchCorpus } from '../runtime/search-docs.mjs';
import { validateSource, validateArchive, validateDocumentIdentity, hash, root, skill } from '../tooling/package.mjs';
import { buildZip, readZip } from '../tooling/lib/zip.mjs';

test('official corpus hashes, coverage and authored links',async()=>{ const report=await validateSource(); assert(report.officialDocuments===226); });
test('inspector labels conflicting legacy and release candidates without executing PHP or leaking values',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'suitecrm-inspect-'));
  await mkdir(path.join(dir,'public/legacy'),{recursive:true});
  await writeFile(path.join(dir,'composer.json'),JSON.stringify({version:'8.9.1',name:'private/customer',password:'DO_NOT_EMIT'}));
  await writeFile(path.join(dir,'public/legacy/suitecrm_version.php'),"<?php\n$suitecrm_version = '7.14.6';\nthrow new Exception('EXECUTED_SECRET');\n");
  await writeFile(path.join(dir,'.env'),'PASSWORD=DO_NOT_EMIT');
  const before=await readFile(path.join(dir,'composer.json'));
  const report=await inspect(dir), output=JSON.stringify(report);
  assert.deepEqual(report.versionCandidates,[{source:'public/legacy/suitecrm_version.php',version:'7.14.6'},{source:'composer.json',version:'8.9.1'}]);
  assert(report.architecture['public/legacy']);
  assert.equal(report.inventory.manifests['composer.json'],true);
  assert.equal(report.inventory.customizationSurfaces['public/legacy/custom'],false);
  assert.match(report.inventory.coreModificationAssessment,/clean release/);
  assert(!/DO_NOT_EMIT|EXECUTED_SECRET|private\/customer/.test(output));
  assert(before.equals(await readFile(path.join(dir,'composer.json'))));
});
test('CLI inspector reports safe errors, no local paths or content',()=>{
  const result=spawnSync(process.execPath,[path.join(root,'runtime/inspect-suitecrm.mjs'),path.join(root,'missing-private-root')],{encoding:'utf8',windowsHide:true});
  assert.equal(result.status,2); assert(!result.stderr.includes(root));
});
test('standalone 7.x retrieval is empty while retained legacy remains available',async()=>{
  const referencesDir=path.join(skill,'references');
  assert.deepEqual(await searchCorpus({referencesDir,scope:'suitecrm-7',query:'Reports'}),[]);
  const retained=await searchCorpus({referencesDir,scope:'legacy-in-8',query:'logic hooks'});
  assert(retained.length); assert(retained.every(r=>r.scope==='legacy-in-8'));
});
test('both built archives match canonical content and optional runtime',async()=>{
  for(const variant of ['openai','opencode']) await validateArchive(path.join(root,'dist',`suitecrm-expert-skill-${variant}.zip`),variant);
});
test('unexpected empty file cannot replace an expected archive entry',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'suitecrm-parity-'));
  const stage=path.join(dir,'stage'); await cp(skill,stage,{recursive:true});
  await unlink(path.join(stage,'SKILL.md'));
  await writeFile(path.join(stage,'unexpected-empty.txt'),'');
  const zip=path.join(dir,'bad.zip');
  await buildZip({sourceDir:stage,outputFile:zip,rootName:'suitecrm-expert-skill'});
  await assert.rejects(validateArchive(zip,'openai'),/Unexpected archive entry/);
});
test('standalone 7.x source cannot be imported or relabelled',()=>{
  const sources=new Set(['suitedocs-8','gpt-snapshot-21']);
  const old={path:'official/suitecrm-7/administration/001.md',scope:'suitecrm-7',sourceId:'gpt-snapshot-21'};
  assert.throws(()=>validateDocumentIdentity(old,sources));
  assert.throws(()=>validateDocumentIdentity({...old,scope:'suitecrm-8',sourceId:'suitedocs-8'},sources));
  assert.throws(()=>validateDocumentIdentity({path:'official/content/admin/test.adoc',scope:'legacy-in-8',sourceId:'suitedocs-8'},sources));
});
test('every retained legacy page has release-matched 8.x evidence',async()=>{
  const provenance=JSON.parse(await readFile(path.join(skill,'references/provenance.json'),'utf8'));
  const retained=provenance.files.filter(f=>f.scope==='legacy-in-8'); assert.equal(retained.length,22);
  assert(!provenance.files.some(f=>f.scope==='suitecrm-7'));
  for(const f of retained) {
    const evidence=provenance.files.find(e=>e.path===f.legacyEvidence.path);
    assert(evidence && evidence.scope==='suitecrm-8');
    assert.equal(evidence.sha256,f.legacyEvidence.sha256);
    assert.equal(evidence.sourceId,f.sourceId);
  }
});
test('installed OpenCode ZIP tools work from an unrelated current directory',async()=>{
  const dir=await mkdtemp(path.join(os.tmpdir(),'suitecrm-installed-'));
  const archive=await readZip(path.join(root,'dist/suitecrm-expert-skill-opencode.zip'));
  for(const entry of archive.entries) {
    const file=path.join(dir,entry.name); await mkdir(path.dirname(file),{recursive:true}); await writeFile(file,entry.data);
  }
  const script=path.join(dir,'suitecrm-expert-skill/scripts/search-docs.mjs');
  const result=spawnSync(process.execPath,[script,'--scope','suitecrm-8','--json','Reports'],{cwd:os.tmpdir(),encoding:'utf8',windowsHide:true});
  assert.equal(result.status,0,result.stderr);
  const results=JSON.parse(result.stdout); assert(results.length); assert(results.every(r=>r.scope==='suitecrm-8'));
  const inspection=spawnSync(process.execPath,[path.join(dir,'suitecrm-expert-skill/scripts/inspect-suitecrm.mjs'),dir],{cwd:os.tmpdir(),encoding:'utf8',windowsHide:true});
  assert.equal(inspection.status,0,inspection.stderr); assert.deepEqual(JSON.parse(inspection.stdout).versionCandidates,[]);
});
