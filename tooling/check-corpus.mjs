import { validateSource } from './package.mjs';
// Deliberately does not equate local integrity with upstream freshness.
try { console.log(JSON.stringify({status:'PASS',...(await validateSource()),freshness:'Not checked online; pinned and owner-supplied sources only'})); }
catch(e) { console.error(e.message); process.exitCode=1; }
