import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { buildZip, readZip } from '../tooling/lib/zip.mjs';

async function fixture() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'suitecrm-zip-'));
  const source = path.join(root, 'suitecrm-8-expert');
  await mkdir(path.join(source, 'nested'), { recursive: true });
  await writeFile(path.join(source, 'SKILL.md'), '---\nname: suitecrm-8-expert\ndescription: Test skill description.\n---\n');
  await writeFile(path.join(source, 'nested', 'notes.txt'), 'hello zip\n');
  return { root, source };
}

function centralOffset(bytes) {
  return bytes.readUInt32LE(bytes.length - 6);
}

function centralEntry(bytes, suffix) {
  let cursor = centralOffset(bytes);
  const count = bytes.readUInt16LE(bytes.length - 12);
  for (let index = 0; index < count; index += 1) {
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    if (name.endsWith(suffix)) return cursor;
    cursor += 46 + nameLength + bytes.readUInt16LE(cursor + 30) + bytes.readUInt16LE(cursor + 32);
  }
  throw new Error(`central entry not found: ${suffix}`);
}

async function twoFileArchive() {
  const { root, source } = await fixture();
  await writeFile(path.join(source, 'alpha.txt'), 'alpha');
  await writeFile(path.join(source, 'bravo.txt'), 'bravo');
  const archive = path.join(root, 'archive.zip');
  await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
  return { root, archive, bytes: await readFile(archive) };
}

test('buildZip writes a deterministic single-root DEFLATE archive that readZip round-trips', async () => {
  const { root, source } = await fixture();
  const first = path.join(root, 'first.zip');
  const second = path.join(root, 'second.zip');
  const [left, right] = await Promise.all([
    buildZip({ sourceDir: source, outputFile: first, rootName: 'suitecrm-8-expert' }),
    buildZip({ sourceDir: source, outputFile: second, rootName: 'suitecrm-8-expert' }),
  ]);
  const [firstBytes, secondBytes] = await Promise.all([readFile(first), readFile(second)]);
  const archive = await readZip(first);

  assert.equal(left.sha256, createHash('sha256').update(firstBytes).digest('hex'));
  assert.equal(left.sha256, right.sha256);
  assert.deepEqual(firstBytes, secondBytes);
  assert.equal(left.fileCount, 2);
  assert.deepEqual(archive.entries.map((entry) => entry.name), [
    'suitecrm-8-expert/SKILL.md',
    'suitecrm-8-expert/nested/notes.txt',
  ]);
  assert.deepEqual(archive.entries.map((entry) => entry.data.toString('utf8')), [
    '---\nname: suitecrm-8-expert\ndescription: Test skill description.\n---\n',
    'hello zip\n',
  ]);
});

test('buildZip rejects symbolic links in the source tree', async (t) => {
  const { root, source } = await fixture();
  try {
    await symlink(path.join(source, 'SKILL.md'), path.join(source, 'linked.md'));
  } catch (error) {
    if (error?.code === 'EPERM' || error?.code === 'EACCES') {
      t.skip(`filesystem links are not permitted: ${error.code}`);
      return;
    }
    throw error;
  }
  await assert.rejects(
    buildZip({ sourceDir: source, outputFile: path.join(root, 'archive.zip'), rootName: 'suitecrm-8-expert' }),
    /symbolic link|reparse point/i,
  );
});

test('readZip rejects unsafe, duplicate, encrypted, descriptor, and invalid archives', async () => {
  const { root, source } = await fixture();
  const archive = path.join(root, 'archive.zip');
  await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
  const valid = await readFile(archive);

  for (const [name, mutate] of Object.entries({
    malformed: (bytes) => { bytes.writeUInt32LE(0, bytes.length - 22); },
    encrypted: (bytes) => { bytes.writeUInt16LE(1, 6); },
    descriptor: (bytes) => { bytes.writeUInt16LE(8, 6); },
    unsupportedMethod: (bytes) => { bytes.writeUInt16LE(99, 8); },
    traversal: (bytes) => { bytes.write('../', 30, 'utf8'); },
  })) {
    const bad = Buffer.from(valid);
    mutate(bad);
    const target = path.join(root, `${name}.zip`);
    await writeFile(target, bad);
    await assert.rejects(readZip(target), /ZIP|archive|encrypted|descriptor|compression|unsafe|malformed/i, name);
  }
});

test('readZip accepts a valid EOCD comment but rejects trailing bytes outside it', async () => {
  const { root, source } = await fixture();
  const archive = path.join(root, 'archive.zip');
  await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
  const original = await readFile(archive);
  const comment = Buffer.from('verified comment');
  const commented = Buffer.concat([original, comment]);
  commented.writeUInt16LE(comment.length, original.length - 2);
  const validComment = path.join(root, 'comment.zip');
  await writeFile(validComment, commented);
  await assert.doesNotReject(readZip(validComment));
  const trailing = path.join(root, 'trailing.zip');
  await writeFile(trailing, Buffer.concat([commented, Buffer.from('x')]));
  await assert.rejects(readZip(trailing), /EOCD|malformed/i);
});

test('readZip rejects duplicate entry names', async () => {
  const { root, archive, bytes } = await twoFileArchive();
  const bad = Buffer.from(bytes);
  const first = centralEntry(bad, '/alpha.txt');
  const second = centralEntry(bad, '/bravo.txt');
  bad.copy(bad, second + 46, first + 46, first + 46 + bad.readUInt16LE(first + 28));
  const target = path.join(root, 'duplicate.zip');
  await writeFile(target, bad);
  await assert.rejects(readZip(target), /duplicate/i);
  void archive;
});

test('readZip rejects case-colliding entry names', async () => {
  const { root, bytes } = await twoFileArchive();
  const bad = Buffer.from(bytes);
  const second = centralEntry(bad, '/bravo.txt');
  const nameOffset = second + 46;
  const name = bad.subarray(nameOffset, nameOffset + bad.readUInt16LE(second + 28)).toString('utf8');
  bad.write(name.replace('bravo.txt', 'ALPHA.txt'), nameOffset, 'utf8');
  const target = path.join(root, 'case-collision.zip');
  await writeFile(target, bad);
  await assert.rejects(readZip(target), /case-conflicting/i);
});

for (const [label, replacement] of [
  ['absolute path', '/uitecrm-8-expert/SKILL.md'],
  ['drive path', 'C:itecrm-8-expert/SKILL.md'],
  ['UNC path', '//itecrm-8-expert/SKILL.md'],
]) {
  test(`readZip rejects an ${label} entry`, async () => {
    const { root, source } = await fixture();
    const archive = path.join(root, 'archive.zip');
    await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
    const bad = await readFile(archive);
    const central = centralOffset(bad);
    bad.write(replacement, central + 46, 'utf8');
    const target = path.join(root, `${label}.zip`);
    await writeFile(target, bad);
    await assert.rejects(readZip(target), /unsafe entry path/i);
  });
}

test('readZip rejects an archive with more than one root', async () => {
  const { root, bytes } = await twoFileArchive();
  const bad = Buffer.from(bytes);
  const second = centralEntry(bad, '/bravo.txt');
  const local = bad.readUInt32LE(second + 42);
  for (const offset of [second + 46, local + 30]) bad.write('othercrm-8-expert', offset, 'utf8');
  const target = path.join(root, 'wrong-root.zip');
  await writeFile(target, bad);
  await assert.rejects(readZip(target), /top-level root/i);
});

test('readZip rejects a ZIP bomb by total declared uncompressed size', async () => {
  const { root, source } = await fixture();
  const archive = path.join(root, 'archive.zip');
  await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
  const bad = await readFile(archive);
  const central = centralOffset(bad);
  bad.writeUInt32LE(2, central + 24);
  const target = path.join(root, 'declared-total.zip');
  await writeFile(target, bad);
  await assert.rejects(readZip(target, { maxUncompressedSize: 1 }), /declared uncompressed size exceeds limit/i);
});

test('readZip rejects a malformed EOCD comment length', async () => {
  const { root, source } = await fixture();
  const archive = path.join(root, 'archive.zip');
  await buildZip({ sourceDir: source, outputFile: archive, rootName: 'suitecrm-8-expert' });
  const bad = await readFile(archive);
  bad.writeUInt16LE(1, bad.length - 2);
  const target = path.join(root, 'bad-comment-length.zip');
  await writeFile(target, bad);
  await assert.rejects(readZip(target), /malformed EOCD/i);
});
