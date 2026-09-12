import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';

import {
  parseArgs,
  runCli,
  searchCorpus,
} from '../runtime/search-docs.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const scriptPath = path.join(projectRoot, 'runtime', 'search-docs.mjs');

function entry(referencePath, title, overrides = {}) {
  return {
    path: referencePath,
    sourcePath: referencePath.replace(/^official\//, ''),
    title,
    officialUrl: `https://docs.example.test/${encodeURIComponent(referencePath)}`,
    scope: 'suitecrm-8',
    topic: 'developer',
    ...overrides,
  };
}

async function makeReferences(t, documents, provenanceEntries = null) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'suitecrm-search-'));
  const referencesDir = path.join(root, 'references');
  await mkdir(referencesDir);

  const entries = [];
  for (const document of documents) {
    const referencePath = document.path;
    const absolutePath = path.join(referencesDir, ...referencePath.split('/'));
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, document.content);
    entries.push(entry(referencePath, document.title, document.metadata));
  }

  await writeFile(
    path.join(referencesDir, 'provenance.json'),
    `${JSON.stringify({ schemaVersion: 1, files: provenanceEntries ?? entries }, null, 2)}\n`,
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  return { root, referencesDir };
}

async function makeLink(t, target, link, type) {
  try {
    await symlink(target, link, process.platform === 'win32' && type === 'dir' ? 'junction' : type);
    return true;
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      t.skip(`filesystem links are not permitted: ${error.code}`);
      return false;
    }
    throw error;
  }
}

test('imports without running the CLI or producing output', () => {
  const result = spawnSync(process.execPath, [
    '--input-type=module',
    '--eval',
    `import(${JSON.stringify(pathToFileURL(scriptPath).href)})`,
  ], { encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('matches NFC-equivalent Unicode L/M/N tokens only at token boundaries', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/accent.adoc', title: 'Accent', content: '= Cafe\u0301 42 Δelta API\nThe Unicode tokens are ready.\n' },
    { path: 'official/prefix.adoc', title: 'Prefix', content: '= Prefix\nCafeteria 420 and myΔeltaAPI.\n' },
  ]);

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'Café' })).map((result) => result.referencePath), [
    'official/accent.adoc',
  ]);
  assert.deepEqual((await searchCorpus({ referencesDir, query: '42 Δelta API' })).map((result) => result.referencePath), [
    'official/accent.adoc',
  ]);
});

test('keeps release tokens exact without prefix collisions', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/releases.adoc', title: 'Releases', content: '= Releases 8.7 8.8+ v8\nCurrent versions.\n' },
    { path: 'official/collisions.adoc', title: 'Collisions', content: '= Collisions 8.70 8.8.1 v80\nOther versions.\n' },
  ]);

  for (const query of ['8.7', '8.8+', 'v8']) {
    assert.deepEqual((await searchCorpus({ referencesDir, query })).map((result) => result.referencePath), [
      'official/releases.adoc',
    ]);
  }
});

test('ranks title, first heading, body, and distinct-token coverage deterministically', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/z-title.adoc', title: 'Other', content: '= OAuth Tokens\nUnrelated prose.\n' },
    { path: 'official/a-heading.adoc', title: 'Other', content: '= Other\n== OAuth Tokens\nUnrelated prose.\n' },
    { path: 'official/body.adoc', title: 'Other', content: '= Other\nOAuth tokens are issued here.\n' },
    { path: 'official/coverage.adoc', title: 'Other', content: '= Other\n== OAuth Guide\nTokens and authentication setup.\n' },
    { path: 'official/repetition.adoc', title: 'Other', content: '= Other\n== OAuth Guide\nOAuth OAuth OAuth OAuth.\n' },
    { path: 'official/tie-b.adoc', title: 'Tie', content: '= Tie\nwebhook\n' },
    { path: 'official/tie-a.adoc', title: 'Tie', content: '= Tie\nwebhook\n' },
  ]);

  const ranked = await searchCorpus({ referencesDir, query: 'oauth' });
  assert.equal(ranked[0].referencePath, 'official/z-title.adoc');
  assert.ok(
    ranked.findIndex((result) => result.referencePath === 'official/a-heading.adoc')
      < ranked.findIndex((result) => result.referencePath === 'official/body.adoc'),
  );
  assert.ok(
    (await searchCorpus({ referencesDir, query: 'oauth tokens' }))
      .findIndex((result) => result.referencePath === 'official/coverage.adoc')
      < (await searchCorpus({ referencesDir, query: 'oauth tokens' }))
        .findIndex((result) => result.referencePath === 'official/repetition.adoc'),
    'distinct-token coverage must beat repetition of one query token',
  );

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'webhook' })).map((result) => result.referencePath), [
    'official/tie-a.adoc',
    'official/tie-b.adoc',
  ]);
});

test('returns every positive match without relative-score suppression', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/strong.adoc', title: 'Queue Queue Queue', content: '= Queue Queue\nQueue queue queue.\n' },
    { path: 'official/weak.adoc', title: 'Other', content: '= Other\nOne queue mention.\n' },
  ]);

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'queue', limit: 10 })).map((result) => result.referencePath), [
    'official/strong.adoc',
    'official/weak.adoc',
  ]);
});

test('anchors multi-token specificity and release tokens outside incidental body mentions', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    {
      path: 'official/saml-87.adoc',
      title: 'SAML 8.7',
      content: '= SAML 8.7+ Configuration\nCurrent environment.\n',
    },
    {
      path: 'official/saml-82.adoc',
      title: 'SAML 8.2',
      content: '= SAML 8.2 Configuration\nUpgrade to 8.7 before use. Login throttling is separate.\n',
    },
    {
      path: 'official/cli-installer.adoc',
      title: 'CLI',
      content: '= Running the CLI Installer\nCommand line workflow.\n',
    },
    {
      path: 'official/ui-installer.adoc',
      title: 'UI',
      content: '= Running the UI Installer\nYou can alternatively use the CLI installer.\n',
    },
    {
      path: 'official/running-migration.adoc',
      title: 'Migration',
      content: '= Running the Migration\nMigration steps.\n',
    },
    {
      path: 'official/running-upgrade.adoc',
      title: 'Upgrade',
      content: '= Running the Upgrade\nRun this after migration.\n',
    },
    {
      path: 'official/before-migrate.adoc',
      title: 'Before migration',
      content: '= Before You Migrate\nMigration prerequisites.\n',
    },
    {
      path: 'official/before-upgrade.adoc',
      title: 'Before upgrade',
      content: '= Before You Upgrade\nRead this before you migrate later.\n',
    },
  ]);

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'SAML 8.7 configuration' })).map((item) => item.referencePath), [
    'official/saml-87.adoc',
  ]);
  assert.deepEqual((await searchCorpus({ referencesDir, query: 'running CLI installer' })).map((item) => item.referencePath), [
    'official/cli-installer.adoc',
  ]);
  assert.deepEqual((await searchCorpus({ referencesDir, query: 'running the migration' })).map((item) => item.referencePath), [
    'official/running-migration.adoc',
  ]);
  assert.deepEqual((await searchCorpus({ referencesDir, query: 'before you migrate' })).map((item) => item.referencePath), [
    'official/before-migrate.adoc',
  ]);
});

test('applies exact scope/topic filters and a validated result limit', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/api.adoc', title: 'OAuth', content: '= OAuth\nToken.\n', metadata: { scope: 'shared-api-v8', topic: 'api-v8' } },
    { path: 'official/admin.adoc', title: 'OAuth', content: '= OAuth\nSettings.\n', metadata: { scope: 'suitecrm-8', topic: 'administration' } },
  ]);

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'oauth', scope: 'shared-api-v8' })).map((result) => result.referencePath), [
    'official/api.adoc',
  ]);
  assert.deepEqual((await searchCorpus({ referencesDir, query: 'oauth', topic: 'administration' })).map((result) => result.referencePath), [
    'official/admin.adoc',
  ]);
  assert.equal((await searchCorpus({ referencesDir, query: 'oauth', limit: 1 })).length, 1);
  await assert.rejects(searchCorpus({ referencesDir, query: 'oauth', limit: 0 }), /limit/i);
});

test('extracts a title and returns bounded control-safe snippets with the stable schema', async (t) => {
  const longPrefix = 'x'.repeat(400);
  const { referencesDir } = await makeReferences(t, [
    {
      path: 'official/snippet.adoc',
      title: '',
      content: `:attribute: ignored\n= Extracted Title\n${longPrefix}\u001b[31m needle <token> & value ${'y'.repeat(400)}\n`,
      metadata: { officialUrl: 'https://docs.example.test/snippet', scope: 'suitecrm-8', topic: 'developer' },
    },
  ]);

  const [result] = await searchCorpus({ referencesDir, query: 'needle' });
  assert.deepEqual(Object.keys(result), [
    'score',
    'title',
    'referencePath',
    'officialUrl',
    'scope',
    'topic',
    'freshness',
    'sourceId',
    'matches',
  ]);
  assert.equal(result.title, 'Extracted Title');
  assert.ok(result.matches.length > 0);
  for (const match of result.matches) {
    assert.equal(typeof match, 'string');
    assert.ok(match.length <= 160, `snippet is ${match.length} characters`);
    assert.doesNotMatch(match, /[\u0000-\u001f\u007f]/u);
    assert.match(match, /needle/i);
    assert.doesNotMatch(match, /<token>| & value/);
    assert.match(match, /&lt;token&gt;|&amp;/);
  }
});

test('searches only provenance-listed official files', async (t) => {
  const listed = { path: 'official/listed.adoc', title: 'Listed', content: '= Listed\nneedle\n' };
  const unlisted = { path: 'official/unlisted.adoc', title: 'Unlisted', content: '= Unlisted\nneedle\n' };
  const { referencesDir } = await makeReferences(t, [listed, unlisted], [entry(listed.path, listed.title)]);

  assert.deepEqual((await searchCorpus({ referencesDir, query: 'needle' })).map((result) => result.referencePath), [
    listed.path,
  ]);
});

test('rejects traversal, absolute, non-official, malformed, and missing provenance entries', async (t) => {
  const unsafePaths = ['../outside.adoc', '/absolute.adoc', 'C:/absolute.adoc', 'playbooks/authored.md'];
  for (const unsafePath of unsafePaths) {
    await t.test(unsafePath, async (subtest) => {
      const { referencesDir } = await makeReferences(subtest, [], [entry(unsafePath, 'Unsafe')]);
      await assert.rejects(searchCorpus({ referencesDir, query: 'unsafe' }), /official|safe relative|absolute|traversal/i);
    });
  }

  await t.test('malformed provenance', async (subtest) => {
    const { referencesDir } = await makeReferences(subtest, []);
    await writeFile(path.join(referencesDir, 'provenance.json'), '{not json');
    await assert.rejects(searchCorpus({ referencesDir, query: 'test' }), /provenance/i);
  });

  await t.test('missing files array', async (subtest) => {
    const { referencesDir } = await makeReferences(subtest, []);
    await writeFile(path.join(referencesDir, 'provenance.json'), '{}\n');
    await assert.rejects(searchCorpus({ referencesDir, query: 'test' }), /provenance.*files/i);
  });

  await t.test('missing listed file', async (subtest) => {
    const { referencesDir } = await makeReferences(subtest, [], [entry('official/missing.adoc', 'Missing')]);
    await assert.rejects(searchCorpus({ referencesDir, query: 'test' }), /missing|ENOENT/i);
  });
});

test('rejects listed files reached through symlinks or junctions', async (t) => {
  const { root, referencesDir } = await makeReferences(t, []);
  const outside = path.join(root, 'outside.adoc');
  const linkedFile = path.join(referencesDir, 'official', 'linked.adoc');
  await writeFile(outside, '= Outside\nneedle\n');
  await mkdir(path.dirname(linkedFile), { recursive: true });
  if (!await makeLink(t, outside, linkedFile, 'file')) return;
  await writeFile(path.join(referencesDir, 'provenance.json'), `${JSON.stringify({ files: [entry('official/linked.adoc', 'Linked')] })}\n`);

  await assert.rejects(searchCorpus({ referencesDir, query: 'needle' }), /symbolic link|reparse point|junction/i);
});

test('rejects a symlink or junction ancestor of a listed file', async (t) => {
  const { root, referencesDir } = await makeReferences(t, []);
  const outsideDirectory = path.join(root, 'outside-directory');
  const linkedDirectory = path.join(referencesDir, 'official', 'linked-directory');
  await mkdir(outsideDirectory);
  await writeFile(path.join(outsideDirectory, 'document.adoc'), '= Outside\nneedle\n');
  await mkdir(path.dirname(linkedDirectory), { recursive: true });
  if (!await makeLink(t, outsideDirectory, linkedDirectory, 'dir')) return;
  await writeFile(
    path.join(referencesDir, 'provenance.json'),
    `${JSON.stringify({ files: [entry('official/linked-directory/document.adoc', 'Linked')] })}\n`,
  );

  await assert.rejects(searchCorpus({ referencesDir, query: 'needle' }), /ancestor.*symbolic link|ancestor.*reparse point|junction/i);
});

test('rejects a symlink or junction ancestor of the references directory', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'suitecrm-search-root-link-'));
  const realParent = path.join(root, 'real-parent');
  const linkedParent = path.join(root, 'linked-parent');
  const referencesDir = path.join(realParent, 'references');
  await mkdir(path.join(referencesDir, 'official'), { recursive: true });
  await writeFile(path.join(referencesDir, 'official', 'document.adoc'), '= Document\nneedle\n');
  await writeFile(
    path.join(referencesDir, 'provenance.json'),
    `${JSON.stringify({ files: [entry('official/document.adoc', 'Document')] })}\n`,
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  if (!await makeLink(t, realParent, linkedParent, 'dir')) return;

  await assert.rejects(
    searchCorpus({ referencesDir: path.join(linkedParent, 'references'), query: 'needle' }),
    /references directory ancestor.*symbolic link|references directory ancestor.*reparse point|junction/i,
  );
});

test('parses positional queries and strict filter options', () => {
  assert.deepEqual(parseArgs(['--json', 'oauth', 'token', '--scope', 'shared-api-v8', '--topic', 'api-v8', '--limit', '7']), {
    scope: 'shared-api-v8',
    topic: 'api-v8',
    limit: 7,
    json: true,
    query: 'oauth token',
  });
  assert.throws(() => parseArgs([]), /query/i);
  assert.throws(() => parseArgs(['query', '--limit', '0']), /limit/i);
  assert.throws(() => parseArgs(['query', '--unknown']), /unknown/i);
});

test('CLI distinguishes success, no matches, usage errors, and corpus errors', async (t) => {
  const { referencesDir } = await makeReferences(t, [
    { path: 'official/api.adoc', title: 'API', content: '= API\nOAuth token\n' },
  ]);
  const stdout = [];
  const stderr = [];
  const dependencies = {
    referencesDir,
    writeOut: (line) => stdout.push(line),
    writeError: (line) => stderr.push(line),
  };

  assert.equal(await runCli(['--json', 'oauth'], dependencies), 0);
  assert.deepEqual(JSON.parse(stdout.join('\n'))[0].referencePath, 'official/api.adoc');
  stdout.length = 0;
  assert.equal(await runCli(['absent'], dependencies), 1);
  assert.equal(stdout.join(''), '');
  assert.equal(stderr.join(''), '');
  assert.equal(await runCli([], dependencies), 2);
  assert.match(stderr.pop(), /query|usage/i);

  await rm(path.join(referencesDir, 'provenance.json'));
  assert.equal(await runCli(['oauth'], dependencies), 2);
  assert.match(stderr.pop(), /provenance|ENOENT/i);
});
