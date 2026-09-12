import { lstat, readFile, realpath } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const installedReferences = path.join(scriptDirectory, '..', 'references');
const defaultReferencesDir = existsSync(installedReferences) ? installedReferences : path.join(scriptDirectory, '..', 'skill', 'suitecrm-expert-skill', 'references');
const USAGE = 'Usage: search-docs.mjs [--scope VALUE] [--topic VALUE] [--limit N] [--json] QUERY...';
const TOKEN_PATTERN = /\p{N}+(?:\.\p{N}+)+(?:\+)?|\p{L}[\p{L}\p{M}\p{N}]*\+?|\p{N}+\+?/gu;

export function parseArgs(args) {
  if (!Array.isArray(args)) throw new TypeError('Arguments must be an array');
  const options = { scope: undefined, topic: undefined, limit: 10, json: false };
  const seen = new Set();
  const query = [];

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--json') {
      if (seen.has(argument)) throw new Error('Duplicate option: --json');
      seen.add(argument);
      options.json = true;
    } else if (argument === '--scope' || argument === '--topic' || argument === '--limit') {
      if (seen.has(argument)) throw new Error(`Duplicate option: ${argument}`);
      const value = args[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      seen.add(argument);
      options[argument.slice(2)] = argument === '--limit' ? parseLimit(value) : value;
      index += 1;
    } else if (argument.startsWith('--')) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      query.push(argument);
    }
  }

  const normalizedQuery = query.join(' ').trim();
  if (!normalizedQuery) throw new Error(USAGE);
  return { ...options, query: normalizedQuery };
}

export async function searchCorpus({ referencesDir, query, scope, topic, limit = 10 }) {
  validateLimit(limit);
  if (typeof referencesDir !== 'string' || referencesDir.length === 0) {
    throw new TypeError('References directory must be a non-empty path');
  }
  if (typeof query !== 'string') throw new TypeError('Query must be a string');

  const querySequence = tokenize(query);
  const tokens = [...new Set(querySequence)];
  if (tokens.length === 0) return [];

  const root = path.resolve(referencesDir);
  await assertNoLinks(root, 'References directory ancestor');
  const physicalRoot = await realpath(root);
  const provenance = await loadProvenance(root);
  const results = [];

  for (const document of provenance.files) {
    if ((scope !== undefined && document.scope !== scope)
      || (topic !== undefined && document.topic !== topic)) continue;

    const filePath = resolveReferencePath(root, document.path);
    let source;
    try {
      const stats = await assertNoLinks(filePath, 'Official reference ancestor');
      if (!stats.isFile()) throw new Error('path is not a regular file');
      const physicalFile = await realpath(filePath);
      if (!containsPath(physicalRoot, physicalFile)) {
        throw new Error(`reference path escapes references directory: ${document.path}`);
      }
      source = await readFile(filePath, 'utf8');
    } catch (error) {
      if (/symbolic link|reparse point|junction|escapes references/i.test(error.message)) throw error;
      throw new Error(`Official reference ${document.path} could not be read: ${error.message}`, { cause: error });
    }

    const { title, body } = extractDocument(source, document.path, document.title);
    const titleTokens = tokenize(title);
    const titleTokenSet = tokenSetWithAliases(titleTokens);
    const bodyTokenCounts = countTokensWithAliases(tokenize(body));
    const bodyTokenSet = new Set(bodyTokenCounts.keys());
    const firstSectionHeading = body.match(/^==+\s+(.+?)\s*$/m)?.[1] ?? '';
    const headingTokenSet = tokenSetWithAliases(tokenize(firstSectionHeading));
    const pathTokenSet = tokenSetWithAliases(tokenize(document.path));
    const exactTitleMatch = containsSequence(titleTokens, querySequence);
    const matchedTokenCount = tokens.filter((token) => (
      titleTokenSet.has(token) || bodyTokenSet.has(token)
    )).length;
    if (matchedTokenCount === 0
      || (tokens.length >= 2 && matchedTokenCount / tokens.length < 0.5)
      || (tokens.length >= 3 && matchedTokenCount < 2)) continue;

    const titleMatchedTokenCount = tokens.filter((token) => titleTokenSet.has(token)).length;
    const headingMatchedTokenCount = tokens.filter((token) => headingTokenSet.has(token)).length;
    if (tokens.length >= 2 && titleMatchedTokenCount === 0 && headingMatchedTokenCount === 0) continue;

    const releaseTokens = tokens.filter((token) => /^\d+\.\d+(?:\.\d+)*(?:\+)?$/.test(token));
    if (releaseTokens.some((token) => !titleTokenSet.has(token) && !headingTokenSet.has(token))) continue;

    if (tokens.length >= 3) {
      const specificTokens = tokens.filter((token) => !isGenericSpecificityToken(token));
      const specificTokenCount = specificTokens.filter((token) => (
        titleTokenSet.has(token) || headingTokenSet.has(token) || pathTokenSet.has(token)
      )).length;
      const allowedMissing = specificTokenCount >= 2 ? 1 : 0;
      if (specificTokenCount < specificTokens.length - allowedMissing) continue;
    }

    const coverage = matchedTokenCount / tokens.length;
    let titleMatched = exactTitleMatch;
    let score = (exactTitleMatch ? 100 : 0) + Math.round(coverage * 40);
    for (const token of tokens) {
      if (titleTokenSet.has(token)) {
        titleMatched = true;
        score += 50;
      }
      if (headingTokenSet.has(token)) score += 30;
      score += Math.min(bodyTokenCounts.get(token) ?? 0, 5) * 2;
    }

    const matches = extractSnippets(body, tokens);
    if (matches.length === 0 && titleMatched) {
      const titleMatch = locateToken(title, new Set(tokens)) ?? { at: 0, length: title.length };
      matches.push(createSnippet(title, titleMatch.at, titleMatch.length));
    }
    results.push({
      score,
      title,
      referencePath: document.path,
      officialUrl: document.officialUrl,
      scope: document.scope,
      topic: document.topic,
      freshness: document.freshness ?? 'unspecified',
      sourceId: document.sourceId ?? 'unspecified',
      matches,
    });
  }

  return results
    .sort((left, right) => right.score - left.score || ordinalCompare(left.referencePath, right.referencePath))
    .slice(0, limit);
}

export async function runCli(args, dependencies = {}) {
  const writeOut = dependencies.writeOut ?? ((message) => process.stdout.write(message));
  const writeError = dependencies.writeError ?? ((message) => process.stderr.write(message));
  try {
    const options = parseArgs(args);
    const results = await searchCorpus({
      referencesDir: dependencies.referencesDir ?? defaultReferencesDir,
      query: options.query,
      scope: options.scope,
      topic: options.topic,
      limit: options.limit,
    });
    if (options.json) {
      writeOut(`${JSON.stringify(results, null, 2)}\n`);
    } else if (results.length > 0) {
      writeOut(`${results.map((result) => [
        `[${result.scope}/${result.topic}] ${result.title}`,
        result.referencePath,
        result.officialUrl,
        `freshness: ${result.freshness}; source: ${result.sourceId}`,
      ].join('\n')).join('\n\n')}\n`);
    }
    return results.length > 0 ? 0 : 1;
  } catch (error) {
    writeError(`${error.message}\n`);
    return 2;
  }
}

async function loadProvenance(referencesDir) {
  const provenancePath = path.join(referencesDir, 'provenance.json');
  let raw;
  try {
    const stats = await assertNoLinks(provenancePath, 'Provenance file ancestor');
    if (!stats.isFile()) throw new Error('provenance.json is not a regular file');
    raw = await readFile(provenancePath, 'utf8');
  } catch (error) {
    if (/symbolic link|reparse point|junction/i.test(error.message)) throw error;
    throw new Error(`Failed to read provenance.json: ${error.message}`, { cause: error });
  }

  let provenance;
  try {
    provenance = JSON.parse(raw);
  } catch (error) {
    throw new Error(`Provenance is malformed JSON: ${error.message}`, { cause: error });
  }
  if (!provenance || !Array.isArray(provenance.files)) {
    throw new Error('Provenance is malformed: files must be an array');
  }

  const paths = new Set();
  const sourcePaths = new Set();
  for (const document of provenance.files) {
    validateDocument(document);
    if (paths.has(document.path)) throw new Error(`Provenance contains duplicate path: ${document.path}`);
    if (sourcePaths.has(document.sourcePath)) {
      throw new Error(`Provenance contains duplicate sourcePath: ${document.sourcePath}`);
    }
    paths.add(document.path);
    sourcePaths.add(document.sourcePath);
  }
  return provenance;
}

function validateDocument(document) {
  if (!document || typeof document !== 'object' || Array.isArray(document)) {
    throw new Error('Provenance contains a malformed file entry');
  }
  for (const field of ['path', 'sourcePath', 'officialUrl', 'scope', 'topic']) {
    if (typeof document[field] !== 'string' || document[field].length === 0) {
      throw new Error(`Provenance contains a malformed file ${field}`);
    }
  }
  validateReferencePath(document.path);
}

function validateReferencePath(referencePath) {
  const driveAbsolute = /^[A-Za-z]:[\\/]/.test(referencePath);
  if (path.isAbsolute(referencePath) || driveAbsolute || referencePath.includes('\\')) {
    throw new Error(`Official reference must use a safe relative POSIX path: ${referencePath}`);
  }
  const segments = referencePath.split('/');
  if (segments[0] !== 'official' || segments.length < 2
    || segments.some((segment) => segment === '' || segment === '.' || segment === '..')) {
    throw new Error(`Official reference must remain below official/: ${referencePath}`);
  }
}

function resolveReferencePath(referencesDir, referencePath) {
  validateReferencePath(referencePath);
  const resolved = path.resolve(referencesDir, ...referencePath.split('/'));
  if (!containsPath(referencesDir, resolved)) {
    throw new Error(`Official reference path traversal is not allowed: ${referencePath}`);
  }
  return resolved;
}

async function assertNoLinks(target, label) {
  const absolute = path.resolve(target);
  const root = path.parse(absolute).root;
  const segments = path.relative(root, absolute).split(path.sep).filter(Boolean);
  let current = root;
  let stats = await lstat(current);
  for (const segment of segments) {
    current = path.join(current, segment);
    stats = await lstat(current);
    if (stats.isSymbolicLink()) {
      throw new Error(`${label} contains a symbolic link, junction, or reparse point: ${current}`);
    }
  }
  return stats;
}

function extractDocument(source, referencePath, provenanceTitle) {
  let content = source.replace(/\r\n?/g, '\n');
  let yamlTitle;
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
  if (frontmatter) {
    const titleLine = frontmatter[1].match(/^title\s*:\s*(.*?)\s*$/mi);
    if (titleLine) yamlTitle = unquote(titleLine[1]);
    content = content.slice(frontmatter[0].length);
  }
  const heading = content.match(/^=\s+(.+?)\s*$/m);
  const title = yamlTitle || heading?.[1] || provenanceTitle
    || path.basename(referencePath, path.extname(referencePath));
  if (heading) content = `${content.slice(0, heading.index)}${content.slice(heading.index + heading[0].length)}`;
  return { title, body: content };
}

function unquote(value) {
  if (value.length >= 2 && ((value.startsWith('"') && value.endsWith('"'))
    || (value.startsWith("'") && value.endsWith("'")))) {
    return value.slice(1, -1);
  }
  return value;
}

function tokenize(value) {
  return [...iterateTokens(value)].map((token) => token.value);
}

function* iterateTokens(value) {
  for (const match of value.matchAll(TOKEN_PATTERN)) {
    yield {
      value: match[0].normalize('NFKC').toLocaleLowerCase('und'),
      at: match.index,
      length: match[0].length,
    };
  }
}

function countTokensWithAliases(tokens) {
  const counts = new Map();
  for (const token of tokens) {
    counts.set(token, (counts.get(token) ?? 0) + 1);
    for (const alias of tokenAliases(token)) counts.set(alias, (counts.get(alias) ?? 0) + 1);
  }
  return counts;
}

function tokenSetWithAliases(tokens) {
  return new Set(tokens.flatMap((token) => [token, ...tokenAliases(token)]));
}

function tokenAliases(token) {
  const release = token.match(/^(\d+\.\d+)(?:\.0)?\+$/);
  if (release) return [release[1]];
  if (/^\p{L}{4,}s$/u.test(token) && !token.endsWith('ss')) return [token.slice(0, -1)];
  if (/^\p{L}{5,}ing$/u.test(token)) {
    const stem = token.slice(0, -3);
    return [stem, `${stem}e`];
  }
  return [];
}

function isGenericSpecificityToken(token) {
  return /^(?:a|an|and|configuration|for|guide|in|of|on|or|running|setup|the|to|with|you)$/u.test(token)
    || /^\p{L}{4,}ly$/u.test(token);
}

function containsSequence(tokens, sequence) {
  if (sequence.length === 0 || sequence.length > tokens.length) return false;
  for (let start = 0; start <= tokens.length - sequence.length; start += 1) {
    if (sequence.every((token, offset) => tokens[start + offset] === token)) return true;
  }
  return false;
}

function extractSnippets(body, tokens) {
  const snippets = [];
  const seen = new Set();
  const targets = new Set(tokens);
  for (const rawLine of body.split('\n')) {
    const line = rawLine
      .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const match = locateToken(line, targets);
    if (!match) continue;
    const snippet = createSnippet(line, match.at, match.length);
    if (!seen.has(snippet)) {
      seen.add(snippet);
      snippets.push(snippet);
      if (snippets.length === 3) break;
    }
  }
  return snippets;
}

function locateToken(value, targets) {
  for (const token of iterateTokens(value)) {
    if (targets.has(token.value)) return { at: token.at, length: token.length };
  }
  return null;
}

function createSnippet(value, matchAt, matchLength) {
  const maximum = 160;
  const matchEnd = matchAt + matchLength;
  let start = Math.max(0, matchAt - Math.floor((maximum - matchLength) / 2));
  let end = Math.min(value.length, start + maximum);
  start = Math.max(0, end - maximum);

  while (escapeHtml(value.slice(start, end)).length > maximum
    && (start < matchAt || end > matchEnd)) {
    const leftLength = escapeHtml(value.slice(start, matchAt)).length;
    const rightLength = escapeHtml(value.slice(matchEnd, end)).length;
    if (start < matchAt && (leftLength >= rightLength || end === matchEnd)) {
      start += codePointWidthAt(value, start);
    } else {
      end -= codePointWidthBefore(value, end);
    }
  }
  return escapeHtml(value.slice(start, end));
}

function codePointWidthAt(value, index) {
  return value.codePointAt(index) > 0xffff ? 2 : 1;
}

function codePointWidthBefore(value, index) {
  const codeUnit = value.charCodeAt(index - 1);
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff ? 2 : 1;
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseLimit(value) {
  if (!/^\d+$/.test(value)) throw new Error('Limit must be an integer from 1 to 100');
  const limit = Number(value);
  validateLimit(limit);
  return limit;
}

function validateLimit(limit) {
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new TypeError('Limit must be an integer from 1 to 100');
  }
}

function containsPath(parent, candidate) {
  const relative = path.relative(parent, candidate);
  return relative === ''
    || (relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative));
}

function ordinalCompare(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

const launchedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (import.meta.url === launchedPath) process.exitCode = await runCli(process.argv.slice(2));
