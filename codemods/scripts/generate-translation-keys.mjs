#!/usr/bin/env node
/**
 * Regenerates `lib/translation-keys.json`: the V1 → V2 translation-key
 * migration map used by `transforms/translations-keys.cjs`.
 *
 * Everything is derived from repository state — the codebase is the source
 * of truth, not the docs:
 *
 *   - V1 catalog        branch `version/v1.x`,
 *                       `packages/shared/assets/src/translations/en-US.json`
 *   - V1 swapConfig     branch `version/v1.x`,
 *                       `packages/shared/core/src/config/translations/swapConfig.json`
 *                       (V1 silently resolved deprecated spellings through it)
 *   - V2 catalog        working tree, `packages/sdk/translations/en-US.json`
 *   - V2 Bento routing  working tree,
 *                       `packages/shared/core/src/vue/bentoTranslations.ts`
 *                       (`BENTO_DOMAIN_OVERRIDES` + `BENTO_COMPONENT_DOMAIN_OVERRIDES`:
 *                       Bento-rendered shared strings resolve through the
 *                       `<domain>.<domainKey>` override namespace)
 *   - domain usage      working tree, `packages/domains/<domain>/vue/src`
 *                       (which domains actually render each Bento UI family)
 *
 * Mapping precedence for a V1 key that no longer resolves verbatim in the
 * V2 catalog:
 *   1. Bento route: the V2 runtime resolves Bento-rendered strings through
 *      `<domain>.<domainKey>` overrides (component-specific rows win over
 *      the generic row), so the routing table is the authoritative channel
 *      and beats structural catalog matches (which can hit unused decoy
 *      keys such as `<domain>.overview.filters.label`).
 *   2. Structural suffix match in the V2 catalog, per domain (e.g.
 *      `common.filters.types.date.label` →
 *      `transactions.overview.common.filters.types.date.label`).
 *   3. Exact-value match with structural overlap (LCS of at least 2
 *      segments), restricted to the key's own domain for domain-scoped keys.
 *   4. Leaf-prefix rename: same parent path and one leaf is a prefix of the
 *      other (e.g. `requestFunds` → `requestFundsWithAmount`).
 *   Keys with no candidate stay unmapped; the codemod flags them stale.
 *
 * Deprecated spellings: any key that appears as a swapConfig *value* is a
 * deprecated spelling; it resolves forward through swapConfig chains to the
 * newest current key and inherits that key's mapping. Composite (array)
 * swapConfig entries cannot be mapped to a single key; they are only listed
 * as known V1 keys. Legacy spellings without a dot are ignored — they
 * cannot be told apart from ordinary object keys.
 *
 * Run from the repository root:
 *   node codemods/scripts/generate-translation-keys.mjs
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GIT_BIN, SAFE_ENV } from '../../scripts/process-translations/safe-env.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..', '..');

const DOMAINS = ['capital', 'disputes', 'payByLink', 'payouts', 'reports', 'transactions'];

const V1_BRANCH = 'version/v1.x';
const V1_CATALOG = 'packages/shared/assets/src/translations/en-US.json';
const V1_SWAP_CONFIG = 'packages/shared/core/src/config/translations/swapConfig.json';
const V2_CATALOG = 'packages/sdk/translations/en-US.json';
const V2_BENTO_ROUTING = 'packages/shared/core/src/vue/bentoTranslations.ts';

// ExternalComponentType → translation domain (packages/shared/types/src/components.ts).
const COMPONENT_DOMAIN = {
    capitalOverview: 'capital',
    capitalOffer: 'capital',
    disputes: 'disputes',
    disputesManagement: 'disputes',
    paymentLinkCreation: 'payByLink',
    paymentLinkDetails: 'payByLink',
    paymentLinksOverview: 'payByLink',
    paymentLinkSettings: 'payByLink',
    payouts: 'payouts',
    payoutDetails: 'payouts',
    reports: 'reports',
    transactions: 'transactions',
    transactionDetails: 'transactions'
};

// Bento UI family per `bento.*` key (second path segment). Used to fan
// `<domain>.<domainKey>` overrides only out to the domains whose external
// components actually render that UI. `chrome` covers shared UI (modals,
// alerts, toasts, copy) that renders in every domain.
const BENTO_FAMILIES = {
    alert: 'chrome',
    baseModal: 'chrome',
    modalFullscreenPage: 'chrome',
    toastItem: 'chrome',
    copy: 'chrome',
    card: 'chrome',
    checkbox: 'chrome',
    fieldLabel: 'chrome'
};
const DEFAULT_BENTO_FAMILY = 'grid'; // data grids, filter bars, pagination, date pickers, dropdowns

// Usage scan per family (searched in `packages/domains/<domain>/vue/src`,
// excluding tests). Derives which domains render each family.
const FAMILY_USAGE_PATTERN = {
    timeline: /TimelineItem|BentoTimeline/,
    file: /FileUploader/,
    grid: /DataGrid|FilterBar|BaseFilter|AllFiltersModal|DateRange|DatePicker/
};

// Git runs through its absolute system path in a fully pinned environment
// (see scripts/process-translations/safe-env.mjs), so it is never resolved
// through an inherited, possibly writable PATH.
const gitShow = (spec) => execFileSync(GIT_BIN, ['show', spec], { cwd: repoRoot, encoding: 'utf8', env: SAFE_ENV });

const v1Catalog = JSON.parse(gitShow(`${V1_BRANCH}:${V1_CATALOG}`));
const v2Catalog = JSON.parse(readFileSync(join(repoRoot, V2_CATALOG), 'utf8'));
const swapConfig = JSON.parse(gitShow(`${V1_BRANCH}:${V1_SWAP_CONFIG}`));
const bentoSource = readFileSync(join(repoRoot, V2_BENTO_ROUTING), 'utf8');

// Locale-independent comparator (UTF-16 code-unit order, like the default
// sort()): keeps the generated JSON deterministic across machines.
const byCodeUnit = (a, b) => {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

const v2Keys = Object.keys(v2Catalog).sort(byCodeUnit);
const v2KeysByDomain = new Map(DOMAINS.map(domain => [domain, v2Keys.filter(key => key.startsWith(`${domain}.`))]));

/**
 * Longest-common-subsequence length over path segments (order-preserving).
 */
const lcsLength = (a, b) => {
    const table = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            table[i][j] = a[i - 1] === b[j - 1] ? table[i - 1][j - 1] + 1 : Math.max(table[i - 1][j], table[i][j - 1]);
        }
    }
    return table[a.length][b.length];
};

// The part of a key comparable against a V2 key under a domain: strip the
// V1 `common.` scope, or the key's own domain prefix.
const stripDomain = (key) => {
    if (key.startsWith('common.')) return key.slice('common.'.length);
    const domain = DOMAINS.find(d => key.startsWith(`${d}.`));
    return domain ? key.slice(domain.length + 1) : key;
};
const allowedDomains = (key) => (key.startsWith('common.') ? DOMAINS : DOMAINS.filter(domain => key.startsWith(`${domain}.`)));
const looksLikeKey = (key) => key.includes('.');

// --- V2 Bento routing ------------------------------------------------------

const sliceBlock = (source, startMarker, endMarker) => {
    const start = source.indexOf(startMarker);
    const end = source.indexOf(endMarker, start);
    return source.slice(start, end === -1 ? undefined : end);
};

const genericBlock = sliceBlock(bentoSource, 'export const BENTO_DOMAIN_OVERRIDES', 'type BentoComponentDomainOverride');
const componentBlock = sliceBlock(bentoSource, 'export const BENTO_COMPONENT_DOMAIN_OVERRIDES', 'const appliesToComponent');

// Named component-name constants (e.g. `OVERVIEW_COMPONENT_NAMES`), resolved
// when a component row references one instead of an inline array. The
// declarations are single-line, so they are parsed per line with plain string
// operations: the name from a minimal identifier regex, the list by slicing
// between the first `[` after `=` and its `]`.
const componentConstants = new Map();
for (const line of bentoSource.split('\n')) {
    const nameMatch = /\bconst\s+(\w+)/.exec(line);
    if (!nameMatch) continue;
    const equals = line.indexOf('=', nameMatch.index + nameMatch[0].length);
    if (equals === -1) continue;
    const open = line.indexOf('[', equals);
    if (open === -1) continue;
    const close = line.indexOf(']', open);
    if (close === -1) continue;
    const components = [...line.slice(open + 1, close).matchAll(/'([^']+)'/g)].map(match => match[1]);
    if (components.length > 0) componentConstants.set(nameMatch[1], components);
}
const parseComponentNames = (source) => {
    const inline = [...source.matchAll(/'([^']+)'/g)].map(match => match[1]);
    return inline.length > 0 ? inline : (componentConstants.get(source.trim()) ?? []);
};

// bentoKey → { generic: domainKey, components: Map<domain, domainKey> }
const bentoRoutes = new Map();
for (const [, bentoKey, domainKey] of genericBlock.matchAll(/\[\s*'([^']+)',\s*'([^']+)'\s*\]/g)) {
    const route = bentoRoutes.get(bentoKey) ?? { generic: null, components: new Map() };
    route.generic = route.generic ?? domainKey;
    bentoRoutes.set(bentoKey, route);
}
for (const [, bentoKey, names, domainKey] of componentBlock.matchAll(
    /bentoKey:\s*'([^']+)',\s*componentNames:\s*(\[[^\]]*\]|[\w$]+),\s*domainKey:\s*'([^']+)'/g
)) {
    const route = bentoRoutes.get(bentoKey) ?? { generic: null, components: new Map() };
    for (const name of parseComponentNames(names)) {
        const domain = COMPONENT_DOMAIN[name];
        if (domain && !route.components.has(domain)) route.components.set(domain, domainKey);
    }
    bentoRoutes.set(bentoKey, route);
}

const bentoFamily = (bentoKey) => {
    const family = bentoKey.split('.')[1] ?? '';
    if (family.startsWith('fileUploader')) return 'file'; // fileUploader, fileUploaderFileCard, fileUploaderRestrictions
    if (family.startsWith('timeline')) return 'timeline'; // timeline, timelineItem
    return BENTO_FAMILIES[family] ?? DEFAULT_BENTO_FAMILY;
};

const domainSourceCache = new Map();
const domainSourceUses = (domain, pattern) => {
    let content = domainSourceCache.get(domain);
    if (content === undefined) {
        const sources = [];
        const walk = (directory) => {
            let entries = [];
            try {
                entries = readdirSync(directory);
            } catch {
                return;
            }
            for (const entry of entries) {
                const full = join(directory, entry);
                if (statSync(full).isDirectory()) {
                    walk(full);
                } else if ((full.endsWith('.ts') || full.endsWith('.vue')) && !/\.test\./.test(full)) {
                    sources.push(readFileSync(full, 'utf8'));
                }
            }
        };
        walk(join(repoRoot, 'packages', 'domains', domain, 'vue', 'src'));
        content = sources.join('\n');
        domainSourceCache.set(domain, content);
    }
    return pattern.test(content);
};

const familyDomainsCache = new Map();
const familyDomains = (family) => {
    if (family === 'chrome') return [...DOMAINS];
    if (familyDomainsCache.has(family)) return familyDomainsCache.get(family);
    const pattern = FAMILY_USAGE_PATTERN[family];
    const domains = pattern ? DOMAINS.filter(domain => domainSourceUses(domain, pattern)) : [...DOMAINS];
    familyDomainsCache.set(family, domains);
    return domains;
};

/**
 * Targets for a V1 key routed through the V2 Bento override namespace:
 * `<domain>.<domainKey>` per domain, component-specific rows winning over
 * the generic row. Only domains that render the Bento UI family are fanned
 * out to (override entries for other domains would never resolve).
 */
const bentoTargets = (key) => {
    const targets = {};
    for (const [bentoKey, route] of bentoRoutes) {
        if (route.generic !== key) continue;
        for (const domain of allowedDomains(key)) {
            if (!familyDomains(bentoFamily(bentoKey)).includes(domain)) continue;
            const componentDomainKey = route.components.get(domain);
            const target = componentDomainKey ? `${domain}.${componentDomainKey}` : `${domain}.${key}`;
            if (targets[domain] === undefined) targets[domain] = target;
            else if (targets[domain] !== target) console.warn(`conflicting bento routes for '${key}' in '${domain}': ${targets[domain]} vs ${target}`);
        }
    }
    return targets;
};

// --- V2 catalog matching ---------------------------------------------------

/**
 * Per-domain catalog targets for a V1 key: structural suffix matches first
 * (a V2 key whose path ends with the V1 key's path), then exact-value
 * matches with an LCS of at least 2 shared segments.
 *
 * Deeper suffix matches (a V2 key whose path contains the V1 path after
 * extra prefix segments, e.g. `overview.chargebacks.` before
 * `errors.updateFilters`) additionally require a matching value or an LCS
 * of at least 3: same-suffix keys under a different feature context with a
 * reworded value are decoys, not relocations.
 */
const catalogTargets = (key) => {
    const rest = stripDomain(key);
    const restSegments = rest.split('.');
    const value = v1Catalog[key];
    const targets = {};
    for (const domain of allowedDomains(key)) {
        const candidates = [];
        for (const v2Key of v2KeysByDomain.get(domain) ?? []) {
            const v2Rest = v2Key.slice(domain.length + 1);
            const v2Segments = v2Rest.split('.');
            const exactHit = v2Rest === rest;
            const suffixHit = !exactHit && v2Rest.endsWith(`.${rest}`);
            const valueHit = v2Catalog[v2Key] === value;
            if (!exactHit && !suffixHit && !valueHit) continue;
            candidates.push({ key: v2Key, exactHit, suffixHit, valueHit, lcs: lcsLength(restSegments, v2Segments), length: v2Segments.length });
        }
        if (candidates.length === 0) continue;
        candidates.sort(
            (a, b) =>
                b.lcs - a.lcs ||
                Number(b.exactHit) - Number(a.exactHit) ||
                Number(b.suffixHit) - Number(a.suffixHit) ||
                Number(b.valueHit) - Number(a.valueHit) ||
                a.length - b.length ||
                a.key.localeCompare(b.key)
        );
        const best = candidates[0];
        const acceptable =
            best.exactHit || (best.suffixHit && (best.valueHit || best.lcs >= 3)) || (best.valueHit && best.lcs >= 2);
        if (acceptable) targets[domain] = best.key;
    }
    return targets;
};

/**
 * Per-domain targets for same-path renames: a V2 key with the identical
 * parent path whose leaf extends (or is extended by) the V1 leaf, e.g.
 * `requestFunds` → `requestFundsWithAmount`.
 */
const leafRenameTargets = (key) => {
    const rest = stripDomain(key);
    const segments = rest.split('.');
    const leaf = segments.at(-1);
    const parent = segments.slice(0, -1).join('.');
    const targets = {};
    if (leaf.length < 4) return targets;
    for (const domain of allowedDomains(key)) {
        for (const v2Key of v2KeysByDomain.get(domain) ?? []) {
            const v2Rest = v2Key.slice(domain.length + 1);
            const v2Segments = v2Rest.split('.');
            if (v2Segments.slice(0, -1).join('.') !== parent) continue;
            const v2Leaf = v2Segments.at(-1);
            if (v2Leaf.length < 4) continue;
            if (v2Leaf.startsWith(leaf) || leaf.startsWith(v2Leaf)) {
                targets[domain] = v2Key;
                break;
            }
        }
    }
    return targets;
};

// --- Deprecated spellings (V1 swapConfig) -----------------------------------

// swapConfig maps currentKey → legacyKey (or a composite array of pieces);
// V1 resolved user overrides on the legacy spelling through it. Reverse it
// to resolve legacy spellings forward to the newest current key. Composite
// pieces cannot resolve to a single key and are only listed as known.
const reverseChain = new Map();
const compositeLegacyKeys = new Set();
for (const [currentKey, legacy] of Object.entries(swapConfig)) {
    if (typeof legacy === 'string') {
        if (reverseChain.has(legacy) && reverseChain.get(legacy) !== currentKey) {
            reverseChain.set(legacy, null); // ambiguous: more than one current key
        } else if (!reverseChain.has(legacy)) {
            reverseChain.set(legacy, currentKey);
        }
    } else if (Array.isArray(legacy)) {
        for (const piece of legacy) {
            if (typeof piece === 'string') compositeLegacyKeys.add(piece);
        }
    }
}

const resolveNewest = (key) => {
    const seen = new Set([key]);
    let current = key;
    while (reverseChain.has(current)) {
        const next = reverseChain.get(current);
        if (next === null || seen.has(next)) break; // ambiguous or cycle
        seen.add(next);
        current = next;
    }
    return current;
};

// --- Build the mapping ------------------------------------------------------

const orderedTargets = (targets) =>
    Object.fromEntries(DOMAINS.filter(domain => targets[domain] !== undefined).map(domain => [domain, targets[domain]]));

const currentKeyMapping = new Map(); // V1 catalog key → targets (or null: resolves verbatim / unmapped)
for (const key of Object.keys(v1Catalog)) {
    if (key in v2Catalog) {
        currentKeyMapping.set(key, null); // resolves verbatim in V2: keep as-is
        continue;
    }
    const bento = bentoTargets(key);
    if (Object.keys(bento).length > 0) {
        currentKeyMapping.set(key, orderedTargets(bento));
        continue;
    }
    const catalog = catalogTargets(key);
    if (Object.keys(catalog).length > 0) {
        currentKeyMapping.set(key, orderedTargets(catalog));
        continue;
    }
    const leaf = leafRenameTargets(key);
    currentKeyMapping.set(key, Object.keys(leaf).length > 0 ? orderedTargets(leaf) : null);
}

const mapping = {};
const stale = [];
for (const [key, targets] of currentKeyMapping) {
    if (targets) mapping[key] = targets;
    else if (!(key in v2Catalog)) stale.push(key);
}

// Deprecated spellings inherit the mapping of their newest current key.
const knownV1Keys = new Set([...Object.keys(v1Catalog), ...[...reverseChain.keys(), ...compositeLegacyKeys].filter(looksLikeKey)]);
const legacyStats = { mapped: 0, unmapped: 0, ignored: 0 };
for (const legacyKey of [...reverseChain.keys()].filter(looksLikeKey)) {
    if (compositeLegacyKeys.has(legacyKey)) {
        legacyStats.ignored += 1; // composite piece: cannot map to a single key
        continue;
    }
    const newest = resolveNewest(legacyKey);
    if (newest === legacyKey) {
        legacyStats.unmapped += 1;
        continue;
    }
    if (newest in v2Catalog) {
        mapping[legacyKey] = { [newest.split('.')[0]]: newest };
        legacyStats.mapped += 1;
        continue;
    }
    const targets = currentKeyMapping.get(newest);
    if (targets) {
        mapping[legacyKey] = targets;
        legacyStats.mapped += 1;
    } else {
        legacyStats.unmapped += 1;
    }
}
for (const piece of compositeLegacyKeys) {
    if (looksLikeKey(piece) && !(piece in mapping)) legacyStats.ignored += 1;
}

const outDir = join(here, '..', 'lib');
mkdirSync(outDir, { recursive: true });
const output = {
    v2Keys,
    knownV1Keys: [...knownV1Keys].sort(byCodeUnit),
    mapping: Object.fromEntries(Object.keys(mapping).sort(byCodeUnit).map(key => [key, mapping[key]]))
};
writeFileSync(join(outDir, 'translation-keys.json'), `${JSON.stringify(output, null, 4)}\n`);

const targetCount = Object.values(output.mapping).reduce((total, targets) => total + Object.keys(targets).length, 0);
console.log(`Wrote lib/translation-keys.json`);
console.log(`  V2 catalog keys:            ${v2Keys.length}`);
console.log(`  known V1 keys (incl. legacy): ${output.knownV1Keys.length}`);
console.log(`  mapped V1 keys:            ${Object.keys(output.mapping).length} (${targetCount} domain targets)`);
console.log(`  deprecated spellings:      ${legacyStats.mapped} mapped, ${legacyStats.unmapped} unmapped, ${legacyStats.ignored} composite-only`);
if (stale.length > 0) {
    console.log(`  unmapped (dropped or reworded in V2 — the codemod flags these): ${stale.length}`);
    for (const key of stale) console.log(`    - ${key}`);
}
