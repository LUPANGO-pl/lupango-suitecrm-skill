import { createHash } from 'node:crypto';
import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_SIGNATURE = 0x06054b50;
const UTF8_FLAG = 0x0800;
const METHOD_DEFLATE = 8;
const DOS_DATE = 0x0021;
const MAX_UNCOMPRESSED_TOTAL = 500 * 25 * 1024 * 1024;

const crcTable = Uint32Array.from({ length: 256 }, (_, initial) => {
  let value = initial;
  for (let bit = 0; bit < 8; bit += 1) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  return value >>> 0;
});

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = (value >>> 8) ^ crcTable[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
}

function compareOrdinal(left, right) {
  return Buffer.from(left, 'utf8').compare(Buffer.from(right, 'utf8'));
}

function fail(message) {
  throw new Error(`invalid ZIP archive: ${message}`);
}

function assertSafeArchivePath(name) {
  if (
    !name || name.includes('\\') || name.startsWith('/') || name.startsWith('//')
    || /^[A-Za-z]:/.test(name) || name.includes(':') || name.endsWith('/')
    || name.split('/').some((part) => !part || part === '.' || part === '..')
  ) fail(`unsafe entry path: ${name}`);
}

async function assertNoLinks(target, label) {
  const absolute = path.resolve(target);
  const root = path.parse(absolute).root;
  let current = root;
  for (const part of absolute.slice(root.length).split(path.sep).filter(Boolean)) {
    current = path.join(current, part);
    const stat = await lstat(current);
    if (stat.isSymbolicLink()) throw new Error(`${label} contains a symbolic link or reparse point: ${current}`);
  }
}

async function collectFiles(root, relative = '') {
  const result = [];
  for (const entry of await readdir(path.join(root, relative), { withFileTypes: true })) {
    const absolute = path.join(root, relative, entry.name);
    const archivePath = path.posix.join(relative.replaceAll('\\', '/'), entry.name);
    const stat = await lstat(absolute);
    if (stat.isSymbolicLink()) throw new Error(`source contains a symbolic link or reparse point: ${archivePath}`);
    if (stat.isDirectory()) result.push(...await collectFiles(root, archivePath));
    else if (stat.isFile()) result.push({ absolute, relative: archivePath });
    else throw new Error(`source contains a non-regular file: ${archivePath}`);
  }
  return result.sort((left, right) => compareOrdinal(left.relative, right.relative));
}

function localRecord(name, data, compressed, crc) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(LOCAL_SIGNATURE, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(UTF8_FLAG, 6);
  header.writeUInt16LE(METHOD_DEFLATE, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(DOS_DATE, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(data.length, 22);
  header.writeUInt16LE(Buffer.byteLength(name), 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function centralRecord(name, data, compressed, crc, offset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(CENTRAL_SIGNATURE, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(UTF8_FLAG, 8);
  header.writeUInt16LE(METHOD_DEFLATE, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(DOS_DATE, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(compressed.length, 20);
  header.writeUInt32LE(data.length, 24);
  header.writeUInt16LE(Buffer.byteLength(name), 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return header;
}

export async function buildZip({ sourceDir, outputFile, rootName }) {
  if (!sourceDir || !outputFile || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rootName ?? '')) throw new Error('sourceDir, outputFile, and a safe rootName are required');
  const source = path.resolve(sourceDir);
  await assertNoLinks(source, 'source directory');
  const sourceStat = await lstat(source);
  if (!sourceStat.isDirectory()) throw new Error(`source directory is not a directory: ${source}`);
  const files = await collectFiles(source);
  const local = [];
  const central = [];
  let offset = 0;
  let uncompressedSize = 0;
  let largestFile = { path: null, size: 0 };
  for (const file of files) {
    const data = await readFile(file.absolute);
    const compressed = deflateRawSync(data, { level: 9 });
    const name = `${rootName}/${file.relative}`;
    const crc = crc32(data);
    const nameBytes = Buffer.from(name, 'utf8');
    const record = localRecord(name, data, compressed, crc);
    local.push(record, nameBytes, compressed);
    central.push(centralRecord(name, data, compressed, crc, offset), nameBytes);
    offset += record.length + nameBytes.length + compressed.length;
    uncompressedSize += data.length;
    if (data.length > largestFile.size) largestFile = { path: file.relative, size: data.length };
  }
  const centralBytes = Buffer.concat(central);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(EOCD_SIGNATURE, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(centralBytes.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  const bytes = Buffer.concat([...local, centralBytes, eocd]);
  await mkdir(path.dirname(path.resolve(outputFile)), { recursive: true });
  await writeFile(outputFile, bytes);
  return {
    sha256: createHash('sha256').update(bytes).digest('hex'), compressedSize: bytes.length,
    uncompressedSize, fileCount: files.length, largestFile, timestamp: '1980-01-01T00:00:00Z',
  };
}

export async function readZip(zipPath, { maxFiles = 500, maxFileSize = 25 * 1024 * 1024, maxUncompressedSize = MAX_UNCOMPRESSED_TOTAL } = {}) {
  const bytes = await readFile(zipPath);
  if (bytes.length < 22) fail('missing EOCD');
  let eocdOffset = -1;
  for (let offset = bytes.length - 22; offset >= Math.max(0, bytes.length - 65557); offset -= 1) {
    if (bytes.readUInt32LE(offset) === EOCD_SIGNATURE && offset + 22 + bytes.readUInt16LE(offset + 20) === bytes.length) {
      eocdOffset = offset;
      break;
    }
  }
  if (eocdOffset === -1) fail('malformed EOCD');
  if (bytes.readUInt16LE(eocdOffset + 4) !== 0 || bytes.readUInt16LE(eocdOffset + 6) !== 0) fail('multi-disk archives are unsupported');
  const count = bytes.readUInt16LE(eocdOffset + 10);
  if (count !== bytes.readUInt16LE(eocdOffset + 8) || count > maxFiles) fail('file count exceeds limit or EOCD disagrees');
  const centralSize = bytes.readUInt32LE(eocdOffset + 12);
  const centralOffset = bytes.readUInt32LE(eocdOffset + 16);
  if (centralOffset + centralSize !== eocdOffset || centralOffset > bytes.length) fail('malformed central directory');
  const entries = [];
  const names = new Set();
  const foldedNames = new Set();
  let total = 0;
  let cursor = centralOffset;
  for (let index = 0; index < count; index += 1) {
    if (cursor + 46 > eocdOffset || bytes.readUInt32LE(cursor) !== CENTRAL_SIGNATURE) fail('malformed central directory entry');
    const flags = bytes.readUInt16LE(cursor + 8);
    const method = bytes.readUInt16LE(cursor + 10);
    const crc = bytes.readUInt32LE(cursor + 16);
    const compressedSize = bytes.readUInt32LE(cursor + 20);
    const uncompressedSize = bytes.readUInt32LE(cursor + 24);
    const nameLength = bytes.readUInt16LE(cursor + 28);
    const extraLength = bytes.readUInt16LE(cursor + 30);
    const commentLength = bytes.readUInt16LE(cursor + 32);
    const localOffset = bytes.readUInt32LE(cursor + 42);
    const end = cursor + 46 + nameLength + extraLength + commentLength;
    if (end > eocdOffset || !(flags & UTF8_FLAG) || (flags & 1) || (flags & 8) || method !== METHOD_DEFLATE || extraLength || commentLength) fail('unsupported encrypted, descriptor, compression, or extra archive entry');
    if (uncompressedSize > maxFileSize || (total += uncompressedSize) > maxUncompressedSize) fail('declared uncompressed size exceeds limit');
    const name = bytes.subarray(cursor + 46, cursor + 46 + nameLength).toString('utf8');
    assertSafeArchivePath(name);
    const folded = name.toLocaleLowerCase('en-US');
    if (names.has(name) || foldedNames.has(folded)) fail(`duplicate or case-conflicting entry: ${name}`);
    names.add(name); foldedNames.add(folded);
    if (localOffset + 30 > centralOffset || bytes.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) fail('missing local entry');
    const localFlags = bytes.readUInt16LE(localOffset + 6);
    const localMethod = bytes.readUInt16LE(localOffset + 8);
    const localNameLength = bytes.readUInt16LE(localOffset + 26);
    const localExtraLength = bytes.readUInt16LE(localOffset + 28);
    if (localFlags !== flags || localMethod !== method || localExtraLength || bytes.readUInt32LE(localOffset + 14) !== crc || bytes.readUInt32LE(localOffset + 18) !== compressedSize || bytes.readUInt32LE(localOffset + 22) !== uncompressedSize) fail('local and central entry metadata disagree');
    const localName = bytes.subarray(localOffset + 30, localOffset + 30 + localNameLength).toString('utf8');
    const dataStart = localOffset + 30 + localNameLength + localExtraLength;
    const dataEnd = dataStart + compressedSize;
    if (localName !== name || dataEnd > centralOffset) fail('malformed local entry');
    let data;
    try { data = inflateRawSync(bytes.subarray(dataStart, dataEnd), { maxOutputLength: maxFileSize }); } catch { fail(`cannot inflate entry: ${name}`); }
    if (data.length !== uncompressedSize || crc32(data) !== crc) fail(`entry checksum or size mismatch: ${name}`);
    entries.push({ name, data, compressedSize, uncompressedSize, crc32: crc });
    cursor = end;
  }
  if (cursor !== eocdOffset) fail('central directory length mismatch');
  const roots = new Set(entries.map(({ name }) => name.split('/')[0]));
  if (roots.size !== 1) fail('archive must contain exactly one top-level root');
  return { entries, fileCount: entries.length, compressedSize: bytes.length, uncompressedSize: total, rootName: [...roots][0] };
}
