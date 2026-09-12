import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'tests');
const files=(await readdir(dir,{withFileTypes:true})).filter(e=>e.isFile()&&e.name.endsWith('.test.mjs')).map(e=>path.join(dir,e.name)).sort();
if(!files.length) {console.error('No tests found');process.exitCode=2;}
else { const result=spawnSync(process.execPath,['--test',...files],{cwd:root,stdio:'inherit',windowsHide:true}); process.exitCode=result.status??2; }
