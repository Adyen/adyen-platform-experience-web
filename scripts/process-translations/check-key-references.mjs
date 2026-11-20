import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ENUM_MIRROR_PATHS, grammarViolations } from './key-grammar.mjs';

// Keeps the translation keyspace and the code that references it in step.
// Four checks run over every source file under packages/, src/ and mocks/:
//
//   1. literal keys     — a quoted full key must exist in a catalog
//   2. dynamic prefixes — a prefix a key is assembled from, whether through
//                         `createKeyFactoryFromConfig({ prefix, suffix })`, a
//                         template literal, or a standalone prefix argument,
//                         must match at least one catalog key
//   3. reachability     — catalog keys that no reference can reach are dead
//                         copy; reported, and failed only under --strict
//   4. domain-relative  — override-route targets and `getDomainTranslationKey`
//                         call-site literals, resolved as `<domain>.<value>`
//                         the way the runtime resolves them. Call sites must
//                         hold in at least one domain, domain routes may stay
//                         dormant until a domain adopts the target, and
//                         component routes must exist because the runtime
//                         throws when they do not. Route targets are also
//                         held to the shared key grammar, so the reserved
//                         keyspace can never drift from the catalogs.
//
// Checks 1, 2 and 4 exist because none of the forms is visible to type
// checking: a renamed catalog key turns `i18n.get` into a no-op that returns
// the key, so the UI silently falls back to raw API values instead of
// failing. Checks 1 and 4 cover production code only; tests legitimately use
// synthetic keys to exercise fallbacks, so their unknown keys are listed, not
// failed.
//
// Bento mirror keys that no route points at are the fallback copy Bento
// renders by design, so the reachability report lists them separately from
// dead copy, and --strict does not fail on them.
//
// Deliberate exceptions live in ALLOWED_UNMATCHED_PREFIXES with their
// evidence. That list is kept honest from both sides: an entry that starts
// matching catalog keys fails the run too, so it cannot outlive its reason.

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const rootArgument = process.argv.find(argument => argument.startsWith('--root='))?.slice('--root='.length);
const projectRoot = rootArgument ? path.resolve(rootArgument) : path.resolve(scriptDirectory, '../..');
const strict = process.argv.includes('--strict');
// The Bento mirror is optional: it only exists once the vendor catalogs are synced.
const catalogPaths = [
    path.join(projectRoot, 'packages/sdk/translations/en-US.json'),
    path.join(projectRoot, 'packages/sdk/translations/bento/en-US.json'),
];

const scanRoots = ['packages', 'src', 'mocks'].map(directory => path.join(projectRoot, directory));
const skippedDirectories = new Set(['node_modules', 'dist', 'coverage', 'coverage-unit', 'translations', '__snapshots__']);
const scannedExtensions = new Set(['.ts', '.tsx', '.vue', '.json']);

// The grammar puts every key at three segments or more, so shorter dotted
// strings in a catalog namespace are something else (`transactions.csv`).
const MIN_KEY_SEGMENTS = 3;
// Truncated by default; --strict callers care about every entry.
const REPORT_LIMIT = strict ? Number.POSITIVE_INFINITY : 40;

// Dynamic keys that intentionally resolve to nothing. `getTransactionTimeline*`
// renders the raw API status/type through its originalValueFallback, and no
// catalog has ever carried copy for those two enum families.
const ALLOWED_UNMATCHED_PREFIXES = new Set(['transactions.details.timeline.statuses.', 'transactions.details.timeline.types.']);

const SEGMENT = '[a-zA-Z][a-zA-Z0-9_-]*';
const quotedKeyPattern = new RegExp(`(['"\`])((?:${SEGMENT})(?:\\.${SEGMENT})+)\\1`, 'g');
// A quoted string that is nothing but a dotted prefix.
const quotedPrefixPattern = new RegExp(`(['"\`])((?:${SEGMENT}\\.)+)\\1`, 'g');
const trailingPrefixPattern = new RegExp(`(?:${SEGMENT}\\.)+$`);
const keyFactoryPattern = /createKeyFactoryFromConfig\(\s*\{([^}]*)\}/g;
const configEntryPattern = name => new RegExp(`${name}:\\s*(['"\`])([^'"\`]*)\\1`);
// A key segment produced by interpolating one enum value.
const INTERPOLATED_SEGMENT = '[a-zA-Z0-9_-]+';

// Reads the template literal whose opening backtick is at `start` and returns
// its static chunks — one more than the number of interpolations, so
// `a.b.${x}.${y}` yields ['a.b.', '.', '']. Interpolations are skipped
// brace-aware rather than by regex, because an expression may contain braces
// of its own. Returns null when the literal does not terminate.
const readTemplateLiteral = (text, start) => {
    const chunks = [];
    let chunk = '';
    for (let index = start + 1; index < text.length; index += 1) {
        const character = text[index];
        if (character === '\\') {
            chunk += text[index + 1] ?? '';
            index += 1;
        } else if (character === '`') {
            chunks.push(chunk);
            return { chunks, end: index };
        } else if (character === '$' && text[index + 1] === '{') {
            chunks.push(chunk);
            chunk = '';
            let depth = 1;
            index += 2;
            for (; index < text.length && depth > 0; index += 1) {
                if (text[index] === '{') depth += 1;
                else if (text[index] === '}') depth -= 1;
            }
            index -= 1;
        } else {
            chunk += character;
        }
    }
    return null;
};

// `getDomainTranslationKey(domain, 'literal')` call sites: the second argument
// names a key relative to the first argument's translation domain. A second
// argument containing an interpolation is dynamic and stays unchecked, like
// every other dynamic form.
const domainRelativeCallPattern = /getDomainTranslationKey\(\s*[A-Za-z_$][\w$]*\s*,\s*(['"`])([^'"`$]+)\1\s*\)/g;
// The two routing tables. Entries are parsed in place, so a table whose
// declaration is present but whose entries do not parse fails loudly instead
// of silently skipping every route it declares.
const domainRouteTablePattern = /BENTO_DOMAIN_OVERRIDES\s*=\s*\[([\s\S]*?)\]\s*as const/;
const componentRouteTablePattern = /BENTO_COMPONENT_DOMAIN_OVERRIDES\s*=\s*\[([\s\S]*?)\]\s*as const/;
const domainRouteDeclarationPattern = /BENTO_DOMAIN_OVERRIDES\s*=\s*\[/;
const componentRouteDeclarationPattern = /BENTO_COMPONENT_DOMAIN_OVERRIDES\s*=\s*\[/;
const routeTuplePattern = /\[\s*'([^']+)'\s*,\s*'([^']+)'\s*\]/g;
const componentRoutePattern = /bentoKey:\s*'([^']+)',\s*componentNames:\s*\[([^\]]*)\],\s*domainKey:\s*'([^']+)'/g;

// CLI tool output; one sanctioned console call site per stream.
const log = (...args) => console.log(...args); // NOSONAR: CLI report output
const logError = (...args) => console.error(...args); // NOSONAR: CLI report output

const lineAt = (text, index) => {
    let line = 1;
    let pos = 0;
    while ((pos = text.indexOf('\n', pos)) !== -1 && pos < index) {
        line++;
        pos++;
    }
    return line;
};
const escapeForRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const isTestFile = file => /\.(test|spec)\./.test(file);

const walk = async directory => {
    let entries;
    try {
        entries = await readdir(directory, { withFileTypes: true });
    } catch {
        return [];
    }
    const files = [];
    for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
            if (skippedDirectories.has(entry.name)) continue;
            files.push(...(await walk(entryPath)));
        } else if (entry.isFile() && scannedExtensions.has(path.extname(entry.name))) {
            files.push(entryPath);
        }
    }
    return files;
};

const loadCatalog = async () => {
    const keys = [];
    for (const catalogPath of catalogPaths) {
        const contents = await readFile(catalogPath, 'utf8').catch(() => null);
        if (contents !== null) keys.push(...Object.keys(JSON.parse(contents)));
    }
    return {
        keys,
        keySet: new Set(keys),
        // Only strings rooted in a namespace some catalog owns are keys;
        // everything else is an unrelated dotted string (CSS classes, files, …).
        namespaces: new Set(keys.map(key => key.split('.')[0])),
    };
};

// --- collection -------------------------------------------------------------

// Parses one routing table body and hands every entry to the callback with
// its line number. Returns false when the declaration is present but no
// entry matches, which the caller reports as a table that failed to parse.
const readRouteTable = (text, tablePattern, entryPattern, onEntry) => {
    const table = tablePattern.exec(text);
    if (!table) return false;
    const entries = [...table[1].matchAll(entryPattern)];
    const bodyOffset = table.index + table[0].indexOf(table[1]);
    for (const entry of entries) onEntry(entry, lineAt(text, bodyOffset + entry.index));
    return entries.length > 0;
};

const scanFile = (text, file, record) => {
    // A factory config spells a prefix and its suffix in one object, so the
    // quoted prefix inside it is not a reference in its own right: recording
    // it as one would claim every key under the prefix regardless of the
    // suffix the factory actually appends.
    const factoryRanges = [...text.matchAll(keyFactoryPattern)].map(match => [match.index, match.index + match[0].length]);
    const insideFactoryConfig = index => factoryRanges.some(([start, end]) => index >= start && index < end);

    for (const match of text.matchAll(quotedKeyPattern)) {
        record('key', { value: match[2], file, line: lineAt(text, match.index) });
    }
    for (const match of text.matchAll(quotedPrefixPattern)) {
        if (insideFactoryConfig(match.index)) continue;
        record('prefix', { chunks: [match[2], ''], file, line: lineAt(text, match.index) });
    }
    for (let index = text.indexOf('`'); index !== -1; index = text.indexOf('`', index + 1)) {
        const literal = readTemplateLiteral(text, index);
        if (!literal) break;
        const line = lineAt(text, index);
        index = literal.end;
        // One chunk means no interpolation; the quoted-key scan already has it.
        if (literal.chunks.length < 2) continue;
        const lead = trailingPrefixPattern.exec(literal.chunks[0] ?? '');
        if (!lead) continue;
        record('prefix', { chunks: [lead[0], ...literal.chunks.slice(1)], file, line });
    }
    for (const match of text.matchAll(keyFactoryPattern)) {
        const prefix = configEntryPattern('prefix').exec(match[1]);
        const suffix = configEntryPattern('suffix').exec(match[1]);
        if (prefix) record('prefix', { chunks: [prefix[2], suffix?.[2] ?? ''], file, line: lineAt(text, match.index) });
    }
    for (const match of text.matchAll(domainRelativeCallPattern)) {
        record('relative', { value: match[2], referenceKind: 'callSite', componentNames: [], file, line: lineAt(text, match.index) });
    }

    if (domainRouteDeclarationPattern.test(text)) {
        const parsed = readRouteTable(text, domainRouteTablePattern, routeTuplePattern, (entry, line) => {
            record('routedBentoKey', { value: entry[1], file, line });
            record('relative', { value: entry[2], referenceKind: 'route', componentNames: [], file, line });
        });
        if (!parsed) record('tableIssue', { table: 'BENTO_DOMAIN_OVERRIDES', file, line: lineAt(text, text.indexOf('BENTO_DOMAIN_OVERRIDES')) });
    }

    if (componentRouteDeclarationPattern.test(text)) {
        const parsed = readRouteTable(text, componentRouteTablePattern, componentRoutePattern, (entry, line) => {
            record('routedBentoKey', { value: entry[1], file, line });
            record('relative', {
                value: entry[3],
                referenceKind: 'componentRoute',
                componentNames: entry[2]
                    .split(',')
                    .map(name => name.replace(/['\s]/g, ''))
                    .filter(name => name.length > 0),
                file,
                line,
            });
        });
        if (!parsed) {
            record('tableIssue', {
                table: 'BENTO_COMPONENT_DOMAIN_OVERRIDES',
                file,
                line: lineAt(text, text.indexOf('BENTO_COMPONENT_DOMAIN_OVERRIDES')),
            });
        }
    }
};

const collectReferences = async files => {
    const keys = new Map();
    const prefixes = new Map();
    const relative = new Map();
    const routedBentoKeys = new Set();
    const tableIssues = [];
    const add = (collection, id, data, { file, line }) => {
        if (!collection.has(id)) collection.set(id, { ...data, sites: new Set() });
        collection.get(id).sites.add(`${path.relative(projectRoot, file)}:${line}`);
    };
    const record = (kind, entry) => {
        if (kind === 'key') add(keys, entry.value, { value: entry.value }, entry);
        else if (kind === 'prefix') add(prefixes, entry.chunks.join('\u0000'), { chunks: entry.chunks }, entry);
        else if (kind === 'relative') {
            add(
                relative,
                `${entry.referenceKind}\u0000${entry.componentNames.join(',')}\u0000${entry.value}`,
                { value: entry.value, referenceKind: entry.referenceKind, componentNames: entry.componentNames },
                entry
            );
        } else if (kind === 'routedBentoKey') routedBentoKeys.add(entry.value);
        else tableIssues.push({ table: entry.table, site: `${path.relative(projectRoot, entry.file)}:${entry.line}` });
    };

    for (const file of files) {
        scanFile(await readFile(file, 'utf8'), file, record);
    }
    const byValue = (a, b) => (a.value ?? a.chunks.join('*')).localeCompare(b.value ?? b.chunks.join('*'));
    return {
        keys: [...keys.values()].sort(byValue),
        prefixes: [...prefixes.values()].sort(byValue),
        relative: [...relative.values()].sort(byValue),
        routedBentoKeys,
        tableIssues,
    };
};

// --- check 1: literal keys --------------------------------------------------

// A reference may be absolute or relative to the domain it is written in
// (Bento override values and `getDomainTranslationKey` arguments both are),
// and it may name a key or the base path of a subtree: `getContent` appends
// the config entry's own segments to a base path like
// `disputes.management.common.defenseDocuments`. Returns every catalog key the
// reference reaches, so an empty result means the reference resolves nowhere.
const createKeyResolver = ({ keys, keySet, namespaces }) => {
    const candidatesOf = value => (namespaces.has(value.split('.')[0]) ? [value] : [...namespaces].map(namespace => `${namespace}.${value}`));
    const enumMirrors = new Set(ENUM_MIRROR_PATHS);

    // `registeredBasePaths` narrows the base-path half to the enum mirrors
    // `getContent` appends to. Checks that must land on a key pass it: the
    // keyspace's `prefix-collision` rule guarantees a key is never also a base
    // path, so without it a literal that a rename demoted to a bare base path
    // goes on resolving against children it no longer addresses. Reachability
    // passes nothing, because a base path does reach every child.
    return (value, { registeredBasePaths = false } = {}) => {
        const candidates = candidatesOf(value);
        const resolved = candidates.filter(candidate => keySet.has(candidate));
        if (resolved.length > 0) return resolved;
        if (registeredBasePaths && !candidates.some(candidate => enumMirrors.has(candidate))) return [];
        const basePaths = candidates.map(candidate => `${candidate}.`);
        return keys.filter(key => basePaths.some(basePath => key.startsWith(basePath)));
    };
};

const checkLiteralKeys = (references, catalog, resolve) => {
    const failures = [];
    const testOnly = [];
    for (const reference of references) {
        if (reference.value.split('.').length < MIN_KEY_SEGMENTS) continue;
        if (!catalog.namespaces.has(reference.value.split('.')[0])) continue;
        if (resolve(reference.value, { registeredBasePaths: true }).length > 0) continue;

        if ([...reference.sites].every(isTestFile)) testOnly.push(reference);
        else
            failures.push({
                reference,
                reason:
                    resolve(reference.value).length > 0
                        ? 'names a base path rather than a key; a rename probably gave it a role segment'
                        : 'is in no catalog; a rename probably left it behind',
            });
    }
    return { failures, testOnly };
};

// --- check 2: dynamic prefixes ----------------------------------------------

// A dynamic reference is its static chunks with one interpolated segment
// between each pair, so `a.b.${x}.${y}` matches `a.b.<seg>.<seg>` and nothing
// else. Treating the leading chunk as a bare `startsWith` instead would claim
// the whole subtree beneath it, which is how a key could sit in the catalogs
// unreferenced and still count as reached: a template over
// `transactions.overview.list.` covered `list.fields.amount`, a key no
// interpolation could ever produce.
const matchesOf = ({ chunks }, catalogKeys) => {
    const framed = new RegExp(`^${chunks.map(escapeForRegExp).join(INTERPOLATED_SEGMENT)}$`);
    return catalogKeys.filter(key => framed.test(key));
};

const prefixValueOf = ({ chunks }) => chunks[0] ?? '';

const checkPrefixes = (prefixes, catalog) => {
    const failures = [];
    let allowed = 0;
    for (const prefix of prefixes) {
        if (!catalog.namespaces.has(prefixValueOf(prefix).split('.')[0])) continue;
        const matches = matchesOf(prefix, catalog.keys).length;
        const isAllowed = prefix.chunks.length === 2 && !prefix.chunks[1] && ALLOWED_UNMATCHED_PREFIXES.has(prefixValueOf(prefix));

        if (matches === 0 && !isAllowed) {
            failures.push({ reference: prefix, reason: 'matches no catalog key; a rename probably left it behind' });
        } else if (matches > 0 && isAllowed) {
            failures.push({ reference: prefix, reason: `now matches ${matches} catalog keys; remove it from ALLOWED_UNMATCHED_PREFIXES` });
        } else if (isAllowed) {
            allowed += 1;
        }
    }
    return { failures, allowed };
};

// --- check 3: reachability --------------------------------------------------

const findUnreachableKeys = ({ keys, prefixes }, catalog, resolve) => {
    const reachable = new Set();
    for (const reference of keys) {
        for (const key of resolve(reference.value)) reachable.add(key);
    }
    for (const prefix of prefixes) {
        if (!catalog.namespaces.has(prefixValueOf(prefix).split('.')[0])) continue;
        for (const key of matchesOf(prefix, catalog.keys)) reachable.add(key);
    }
    return catalog.keys.filter(key => !reachable.has(key)).sort();
};

const reportUnreachableKeys = (unreachable, unroutedFallbackKeys) => {
    if (unroutedFallbackKeys.length > 0) {
        log(`\n${unroutedFallbackKeys.length} Bento mirror keys have no domain route; Bento renders this fallback copy by design:`);
        for (const key of unroutedFallbackKeys.slice(0, REPORT_LIMIT)) log(`  ${key}`);
        if (unroutedFallbackKeys.length > REPORT_LIMIT) log(`  … ${unroutedFallbackKeys.length - REPORT_LIMIT} more`);
    }
    if (unreachable.length === 0) return;

    const byNamespace = new Map();
    for (const key of unreachable) {
        const namespace = key.split('.')[0];
        byNamespace.set(namespace, (byNamespace.get(namespace) ?? 0) + 1);
    }
    const summary = [...byNamespace].map(([namespace, count]) => `${namespace} ${count}`).join(', ');
    log(`\n${unreachable.length} catalog keys are not reachable from any reference (${summary}).`);
    for (const key of unreachable.slice(0, REPORT_LIMIT)) log(`  ${key}`);
    if (unreachable.length > REPORT_LIMIT) log(`  … ${unreachable.length - REPORT_LIMIT} more`);
    log('Reachability is a report, not a gate: pass --strict to fail on it.');
};

// --- check 4: domain-relative references ------------------------------------

// Override-route targets and `getDomainTranslationKey` call-site literals name
// keys relative to the active translation domain: the runtime resolves them
// as `<domain>.<value>` through getDomainTranslationKey. The flavors differ in
// what they owe the catalogs:
//
//   call sites       production code expects the key, so it must resolve in
//                    at least one domain
//   domain routes    opt-in by design: a domain activates a route by defining
//                    the target, and until then Bento renders its own mirror
//                    copy, so a target no domain defines is a dormant route
//   component routes the runtime throws when the target is missing, so the
//                    target must exist in every routed component's domain
//
// Route targets are additionally held to the shared key grammar
// (key-grammar.mjs), the same rules the keyspace lint enforces on catalogs, so
// a dormant target is always a name a domain can adopt without failing
// `translations:grammar`.

const domainNamespacesOf = catalog => [...catalog.namespaces].filter(namespace => namespace !== 'bento');
const resolvingDomainsOf = (value, domainNamespaces, catalog) => domainNamespaces.filter(domain => catalog.keySet.has(`${domain}.${value}`));
// Component routes need the component's translation domain, the same mapping
// UIElement.getTranslationDomain owns. Parsed from its switch so the gate
// cannot drift from the runtime; returns null when the file is absent or the
// switch cannot be found, which fails loudly as soon as a component route
// exists.
const parseComponentDomains = async () => {
    const uiElementPath = path.join(projectRoot, 'packages/shared/core/src/vue/UIElement.ts');
    const contents = await readFile(uiElementPath, 'utf8').catch(() => null);
    if (contents === null) return null;

    const switchStart = contents.indexOf('getTranslationDomain');
    if (switchStart === -1) return null;
    const switchEnd = contents.indexOf('};', switchStart);
    if (switchEnd === -1) return null;
    const switchBody = contents.slice(switchStart, switchEnd);
    const componentDomains = new Map();
    const routedComponents = [];
    const tokenPattern = /case\s+'([^']+)':|return\s+'([^']+)';/g;
    for (const match of switchBody.matchAll(tokenPattern)) {
        if (match[1] !== undefined) routedComponents.push(match[1]);
        else {
            for (const component of routedComponents) componentDomains.set(component, match[2]);
            routedComponents.length = 0;
        }
    }
    return componentDomains.size > 0 ? componentDomains : null;
};

const checkCallSite = (reference, resolvingDomains, testOnly, failures) => {
    if (resolvingDomains.length > 0) return;
    if ([...reference.sites].every(isTestFile)) testOnly.push(reference);
    else failures.push({ reference, reason: 'is in no domain catalog; a rename probably left it behind' });
};

const checkDomainRoute = (reference, failures) => {
    if (!reference.value.startsWith('common.')) {
        failures.push({ reference, reason: 'does not target the domain-common scope (`common.…`)' });
    }
};

// Route targets are reserved names: no catalog carries them while they stay
// dormant, so the keyspace lint cannot see them. The shared grammar rules
// keep the reserved keyspace adoptable — a domain defining the target must
// not fail `translations:grammar` on arrival.
const checkTargetGrammar = (reference, failures) => {
    for (const { rule, message } of grammarViolations(reference.value)) {
        failures.push({ reference, reason: `violates the ${rule} rule of the key grammar: ${message}` });
    }
};

const checkComponentRoute = (reference, componentDomains, catalog, failures) => {
    for (const componentName of reference.componentNames) {
        const domain = componentDomains?.get(componentName);
        if (domain === undefined) {
            failures.push({ reference, reason: `routes ${componentName}, which has no translation domain in UIElement.getTranslationDomain` });
        } else if (!catalog.keySet.has(`${domain}.${reference.value}`)) {
            failures.push({ reference, reason: `is required by ${componentName} (${domain}); the runtime throws when it is missing` });
        }
    }
};

const checkDomainRelativeReferences = (references, catalog, componentDomains) => {
    const failures = [];
    const testOnly = [];
    const domainNamespaces = domainNamespacesOf(catalog);
    const counts = { callSites: 0, liveTargets: 0, dormantTargets: 0 };

    for (const { table, site } of references.tableIssues) {
        failures.push({
            reference: { value: table, sites: new Set([site]) },
            reason: 'is declared but no entries were parsed; update the table parser',
        });
    }

    for (const reference of references.relative) {
        const resolvingDomains = resolvingDomainsOf(reference.value, domainNamespaces, catalog);

        if (reference.referenceKind === 'callSite') {
            counts.callSites += 1;
            checkCallSite(reference, resolvingDomains, testOnly, failures);
        } else if (reference.referenceKind === 'route') {
            if (resolvingDomains.length > 0) counts.liveTargets += 1;
            else counts.dormantTargets += 1;
            checkDomainRoute(reference, failures);
            checkTargetGrammar(reference, failures);
        } else {
            checkComponentRoute(reference, componentDomains, catalog, failures);
            checkTargetGrammar(reference, failures);
        }
    }

    return { failures, testOnly, ...counts };
};

// --- reporting --------------------------------------------------------------

// A dynamic reference reads back as it was written, with `*` where an
// interpolation stands: `transactions.common.types.*.label`.
const describe = reference => reference.value ?? reference.chunks.join('*');

const reportFailures = failures => {
    logError(`${failures.length} translation key references do not match the catalogs:\n`);
    for (const { reference, reason } of failures) {
        logError(`  ${describe(reference)}`);
        logError(`      ${reason}`);
        for (const site of reference.sites) logError(`      ${site}`);
    }
};

const reportTestOnlyKeys = testOnly => {
    log(`\n${testOnly.length} unknown keys are referenced only by tests (synthetic fixtures are expected here):`);
    for (const reference of testOnly.slice(0, REPORT_LIMIT)) log(`  ${reference.value}  (${reference.sites.size} sites)`);
    if (testOnly.length > REPORT_LIMIT) log(`  … ${testOnly.length - REPORT_LIMIT} more`);
};

const main = async () => {
    const catalog = await loadCatalog();
    const files = [];
    for (const root of scanRoots) files.push(...(await walk(root)));

    const references = await collectReferences(files);
    const resolve = createKeyResolver(catalog);

    const literals = checkLiteralKeys(references.keys, catalog, resolve);
    const prefixes = checkPrefixes(references.prefixes, catalog);
    const domainRelative = checkDomainRelativeReferences(references, catalog, await parseComponentDomains());
    const unreachableKeys = findUnreachableKeys(references, catalog, resolve);
    const unroutedFallbackKeys = unreachableKeys.filter(key => key.startsWith('bento.') && !references.routedBentoKeys.has(key));
    const unreachable = unreachableKeys.filter(key => !key.startsWith('bento.') || references.routedBentoKeys.has(key));
    const failures = [...literals.failures, ...prefixes.failures, ...domainRelative.failures];

    if (failures.length > 0) {
        reportFailures(failures);
        process.exitCode = 1;
        return;
    }

    log(
        `key reference check passed across ${files.length} files: ` +
            `${references.keys.length} literal keys and ${references.prefixes.length} dynamic prefixes resolve to the catalogs ` +
            `(${prefixes.allowed} allowed unmatched); ` +
            `${domainRelative.callSites} domain-relative call sites resolve, ${domainRelative.liveTargets} route targets are live, ` +
            `and ${domainRelative.dormantTargets} are dormant until a domain adopts them.`
    );
    if (literals.testOnly.length > 0 || domainRelative.testOnly.length > 0) {
        reportTestOnlyKeys([...literals.testOnly, ...domainRelative.testOnly]);
    }
    if (unreachable.length > 0 || unroutedFallbackKeys.length > 0) {
        reportUnreachableKeys(unreachable, unroutedFallbackKeys);
        if (strict && unreachable.length > 0) process.exitCode = 1;
    }
};

await main();
