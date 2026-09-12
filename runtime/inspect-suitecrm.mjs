import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function safeFile(root, relative) {
  let cursor=root;
  for(const part of relative.split('/')) {
    cursor=path.join(cursor,part);
    try { const s=await lstat(cursor); if(s.isSymbolicLink()) return null; }
    catch(e) { if(e.code==='ENOENT'||e.code==='ENOTDIR') return null; throw Error('Cannot inspect known metadata'); }
  }
  const s=await lstat(cursor);
  return s.isFile() && s.size <= 1024*1024 ? cursor : null;
}
export async function inspect(root) {
  // Reject links in the supplied root as well as in known metadata paths.
  const absolute=path.resolve(root); let ancestor=path.parse(absolute).root;
  for(const part of absolute.slice(ancestor.length).split(path.sep).filter(Boolean)) {
    ancestor=path.join(ancestor,part);
    if((await lstat(ancestor)).isSymbolicLink()) throw Error('Linked root is not inspected');
  }
  if(!(await lstat(absolute)).isDirectory()) throw Error('Root must be a directory');
  const physical=await realpath(absolute);
  const result={versionCandidates:[],architecture:{},deployment:{},inventory:{manifests:{},customizationSurfaces:{},coreModificationAssessment:'requires a clean release of the exact installed version for comparison'},limitations:['Read-only file evidence; no runtime, database or scheduler health check','Legacy version metadata may differ from the SuiteCRM 8 release','Presence is not proof that a customization is active, supported, or upgrade-safe']};
  for(const rel of ['suitecrm_version.php','public/legacy/suitecrm_version.php','legacy/suitecrm_version.php']) {
    const file=await safeFile(physical,rel); if(!file) continue;
    const text=await readFile(file,'utf8');
    for(const m of text.matchAll(/^\s*\$suitecrm_version\s*=\s*['"](\d+\.\d+(?:\.\d+){0,2})['"]\s*;/gm)) {
      result.versionCandidates.push({source:rel,version:m[1]});
    }
  }
  const composer=await safeFile(physical,'composer.json');
  if(composer) { try {
    const data=JSON.parse(await readFile(composer,'utf8'));
    if(typeof data.version==='string' && /^\d+\.\d+(?:\.\d+){0,2}$/.test(data.version)) result.versionCandidates.push({source:'composer.json',version:data.version});
  } catch { /* Never expose malformed configuration or error text. */ } }
  for(const [category,items] of Object.entries({architecture:['core','extensions','public/legacy','legacy','custom','modules','bin/console'],deployment:['Dockerfile','compose.yml','compose.yaml','docker-compose.yml','docker-compose.yaml','k8s','kubernetes','helm','Chart.yaml']})) {
    for(const rel of items) {
      let current=physical, present=true;
      for(const part of rel.split('/')) { current=path.join(current,part); try { if((await lstat(current)).isSymbolicLink()) {present=false;break;} } catch {present=false;break;} }
      result[category][rel]=present;
    }
  }
  for(const [group,items] of Object.entries({manifests:['composer.json','composer.lock','package.json','package-lock.json','yarn.lock','pnpm-lock.yaml'],customizationSurfaces:['custom','extensions','modules','public/legacy/custom','public/legacy/custom/Extension','public/legacy/modules','config/services','config/services.yaml']})) {
    for(const rel of items) {
      let current=physical, present=true;
      for(const part of rel.split('/')) { current=path.join(current,part); try { if((await lstat(current)).isSymbolicLink()) {present=false;break;} } catch {present=false;break;} }
      result.inventory[group][rel]=present;
    }
  }
  return result;
}
if(process.argv[1] && import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href) {
  try { if(process.argv.length>3) throw Error('Usage: inspect-suitecrm.mjs [ROOT]'); console.log(JSON.stringify(await inspect(process.argv[2] ?? '.'),null,2)); }
  catch { console.error('Inspection failed: expected an accessible directory with no linked ancestors.'); process.exitCode=2; }
}
