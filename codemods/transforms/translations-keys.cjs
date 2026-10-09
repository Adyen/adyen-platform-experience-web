'use strict';

const { v2Keys: V2_KEYS, knownV1Keys: KNOWN_V1_KEYS, mapping: KEY_MAPPING } = require('../lib/translation-keys.json');
const { withSfcSupport } = require('../lib/sfc.cjs');
const { propKeyName, addTodoComment, detectQuoteStyle, report } = require('../lib/ast-utils.cjs');

// Deterministic order for the domain-scoped replacement keys.
const DOMAIN_ORDER = ['capital', 'disputes', 'payByLink', 'payouts', 'reports', 'transactions'];
const V2_KEY_SET = new Set(V2_KEYS);
const KNOWN_V1_KEY_SET = new Set(KNOWN_V1_KEYS);
// Keys the mapping already produces: keep them as-is (also keeps re-runs idempotent).
const MAPPED_TARGET_SET = new Set(Object.values(KEY_MAPPING).flatMap(targets => Object.values(targets)));

// Count/plural family suffixes, e.g. `unit.day__plural` → base `unit.day`.
const FAMILY_SUFFIX = /^(.*)__(plural|\d+)$/;

/**
 * Resolve a V1 translation key to its per-domain V2 override keys.
 *
 * The data comes from `lib/translation-keys.json`, generated from the SDK
 * repository itself (`scripts/generate-translation-keys.mjs`): the V1 and V2
 * catalogs, V1's deprecated-key swap chains, and V2's Bento runtime
 * override routing. Family suffixes (`__plural`, `__0`, …) follow their
 * base key.
 */
function resolveTargets(keyName) {
    const direct = KEY_MAPPING[keyName];
    if (direct) return direct;

    const family = keyName.match(FAMILY_SUFFIX);
    if (!family) return null;
    const base = family[1];
    const baseTargets = KEY_MAPPING[base];
    if (!baseTargets) return null;

    const suffix = keyName.slice(base.length);
    return Object.fromEntries(Object.entries(baseTargets).map(([domain, target]) => [domain, `${target}${suffix}`]));
}

/**
 * True when the property is a re-keyable translation entry: a plain
 * (non-spread, non-computed) property with a dotted key that is not
 * already valid in V2.
 */
function isRekeyableKey(prop, keyName) {
    if (prop.type !== 'ObjectProperty' && prop.type !== 'Property') return false;
    // SDK translation keys are dotted; skips plain property names.
    if (!keyName?.includes('.')) return false;
    return !V2_KEY_SET.has(keyName) && !MAPPED_TARGET_SET.has(keyName);
}

/**
 * V1 → V2 codemod: custom translation key re-keying.
 *
 * V1 resolved shared UI strings from one `common.*` scope and silently
 * accepted deprecated spellings through its swap config. V2 scopes shared
 * strings per domain and resolves Bento-rendered strings through
 * `<domain>.<domainKey>` override namespaces, so most keys survive under
 * different names. This codemod re-keys object properties with a known V1
 * key to the V2 keys that now own that string (generated from the SDK
 * codebase, not just the docs):
 *
 *     translations: { 'en-US': { 'common.actions.copy.labels.done': 'Copied' } }
 *
 * becomes one entry per domain owning the key:
 *
 *     translations: { 'en-US': {
 *         'capital.common.actions.copy.labels.done': 'Copied',
 *         'disputes.common.actions.copy.labels.done': 'Copied',
 *         …
 *     } }
 *
 * Targets that only resolve through a domain override namespace (Bento
 * UI strings such as filter bars, pagination and timelines) are added with
 * a migration-marker comment: they work at runtime but are not part of
 * the typed V2 catalog yet.
 *
 * Keys with no V2 equivalent (dropped or reworded) are kept and flagged
 * with a migration-marker comment. Keys that already resolve in V2, and
 * keys unknown to the SDK (a consumer's own), are left untouched.
 *
 * The scan matches string-literal keys on any object literal in the file,
 * which covers the `translations` option of AdyenPlatformExperience() /
 * core.update() as well as standalone locale objects.
 */
function translationsKeys(file, api) {
    const j = api.jscodeshift;
    const notes = [];
    let mutated = false;

    let root;
    try {
        root = j(file.source);
    } catch {
        // Unparseable for the pinned parser (e.g. unsupported syntax): skip
        // loudly rather than abort the whole migration run.
        report(api, file, ['skipped: the file could not be parsed — migrate it manually']);
        return undefined;
    }

    // Detect the file's quote style before any mutations (new nodes are
    // stamped with double-quoted `extra.raw` and would skew the detection).
    const quote = detectQuoteStyle(root, j);

    /** Re-key one property to its per-domain V2 targets: the first domain takes the original
     * place and value, the remaining domains are inserted right after it. Returns the number
     * of inserted properties, or null when no domain target applies. */
    function reKeyProperty(prop, properties, insertAt, keyName, targets) {
        const orderedTargets = DOMAIN_ORDER.filter(domain => targets[domain] !== undefined).map(domain => [
            domain,
            targets[domain]
        ]);
        if (orderedTargets.length === 0) return null;

        const [first, ...rest] = orderedTargets;
        prop.key = j.stringLiteral(first[1]);
        const inserted = rest.map(([, target]) => j.objectProperty(j.stringLiteral(target), prop.value));
        properties.splice(insertAt, 0, ...inserted);

        // Override-namespace targets resolve at runtime but are not
        // part of the typed catalog yet.
        const namespaceTargets = orderedTargets.filter(([, target]) => !V2_KEY_SET.has(target));
        if (namespaceTargets.length > 0) {
            const targetList = namespaceTargets.map(([, target]) => `'${target}'`).join(', ');
            addTodoComment(
                j,
                prop,
                `Target keys ${targetList} resolve at runtime through the domain override namespace (Bento-rendered shared UI) but are not part of the typed V2 catalog yet — keep them, and cast if TypeScript complains.`
            );
        }

        notes.push(`re-keyed '${keyName}' → ${orderedTargets.map(([, target]) => target).join(', ')}`);
        return inserted.length;
    }

    /** Flag a known V1 key with no V2 equivalent (dropped or reworded). */
    function flagStaleKey(prop, keyName) {
        if (!KNOWN_V1_KEY_SET.has(keyName)) return; // not an SDK key (a consumer's own) — leave it alone
        addTodoComment(
            j,
            prop,
            `'${keyName}' no longer resolves in V2 (dropped or reworded). Remove it, or re-key it against the current en-US catalog (packages/sdk/translations/en-US.json in the SDK repo).`
        );
        notes.push(`flagged stale translation key '${keyName}'`);
        mutated = true;
    }

    root.find(j.ObjectExpression).forEach(objectPath => {
        const properties = objectPath.node.properties || [];
        for (let index = 0; index < properties.length; index += 1) {
            const prop = properties[index];
            const keyName = propKeyName(prop);
            if (!isRekeyableKey(prop, keyName)) continue;

            const targets = resolveTargets(keyName);
            if (targets) {
                const inserted = reKeyProperty(prop, properties, index + 1, keyName, targets);
                if (inserted !== null) {
                    index += inserted;
                    mutated = true;
                }
                continue;
            }

            flagStaleKey(prop, keyName);
        }
    });

    report(api, file, notes);

    return mutated ? root.toSource({ quote }) : undefined;
}

module.exports = withSfcSupport(translationsKeys);
module.exports.parser = 'tsx';
