'use strict';

const data = require('../lib/component-data.cjs');
const { withSfcSupport } = require('../lib/sfc.cjs');
const {
    unwrap,
    unwrapPath,
    propKeyName,
    findPropIndex,
    makeProp,
    addTodoComment,
    booleanLiteralValue,
    statementAnchor,
    detectQuoteStyle,
    report,
} = require('../lib/ast-utils.cjs');

/** True when `name` is one of the SDK components. */
const isComponentName = name => data.COMPONENTS.includes(name);

/** Readable name for an unattributed `.update()` receiver. */
function describeReceiver(node) {
    if (node.type === 'Identifier') return node.name;
    if (node.type === 'ThisExpression') return 'this';
    if (node.type === 'MemberExpression' && !node.computed) {
        const object = describeReceiver(node.object);
        const property = node.property.type === 'Identifier' ? node.property.name : '?';
        return object && object !== 'the receiver' ? `${object}.${property}` : property;
    }
    return 'the receiver';
}

/** The local binding name a destructured property introduces, if any. */
function patternBindingName(patternProp) {
    let value = patternProp.value;
    if (value?.type === 'AssignmentPattern') value = value.left;
    return value?.type === 'Identifier' ? value.name : null;
}

/** Index of the destructured property binding `name` in an ObjectPattern, or -1. */
function findPatternPropIndex(patternNode, name) {
    return (patternNode.properties || []).findIndex(
        prop => (prop.type === 'ObjectProperty' || prop.type === 'Property') && propKeyName(prop) === name
    );
}

/** The type a declarator is annotated with, from `: T` or from an `as`/`satisfies` wrapper. */
function declaredTypeName(declarator) {
    const annotations = [declarator?.id?.typeAnnotation?.typeAnnotation, declarator?.init?.typeAnnotation];
    for (const annotation of annotations) {
        if (annotation?.type === 'TSTypeReference' && annotation.typeName?.type === 'Identifier') {
            return annotation.typeName.name;
        }
    }
    return null;
}

/** Readable "old → new" list of sub-configuration changes, for migration markers. */
function describeSubconfigChanges(rules) {
    const parts = [];
    const renames = Object.entries(rules.renames || {}).map(([oldKey, newKey]) => `'${oldKey}' → '${newKey}'`);
    if (renames.length > 0) parts.push(`renamed ${renames.join(', ')}`);
    const removed = Object.keys(rules.removedProps || {});
    if (removed.length > 0) parts.push(`removed '${removed.join("', '")}'`);
    const required = rules.requiredProps || [];
    if (required.length > 0) parts.push(`now requires '${required.join("', '")}'`);
    return parts.join('; ');
}

/** Readable "old → new" list of callback selection-field renames. */
function describeFieldRenames(fieldRenames) {
    return Object.entries(fieldRenames)
        .map(([oldField, newField]) => `'${oldField}' → '${newField}'`)
        .join(', ');
}

/**
 * Describe what a dropped sub-configuration carried, so the marker tells the
 * consumer whether anything needs re-adding. Anything that is not a plain
 * object literal (built elsewhere, or spread into) cannot be inspected, so it
 * is reported as unverified rather than as carrying nothing.
 */
function describeDroppedSubconfig(subObj) {
    if (subObj?.type !== 'ObjectExpression') {
        return ' Its value is not an object literal in this file, so its contents could not be checked — verify nothing in it is still needed.';
    }

    const entries = (subObj.properties || []).map(propKeyName);
    const dropped = entries.filter(Boolean);
    if (dropped.length > 0) {
        return ` It carried '${dropped.join("', '")}', which has no V2 equivalent; re-add that behaviour another way if it mattered.`;
    }
    if (dropped.length !== entries.length) {
        return ' It contains spread or computed entries, so its contents could not be fully checked — verify nothing in it is still needed.';
    }
    return ' Nothing inside it needed hoisting.';
}

/**
 * V1 → V2 codemod: component prop changes on `new <Component>({ ... })`
 * construction and `<instance>.update({ ... })` calls.
 *
 * What it does (per docs/v2/v1-to-v2-migration-guide.md):
 * - `hideTitle: true`  → `appearance: { titles: 'hidden' }` (merged into an
 *   existing `appearance` object when present); `hideTitle: false` is dropped.
 * - List components: `preferredLimit` moves into `pagination.defaultLimit`,
 *   and `allowLimitSelection` flips into `pagination.disableLimitSelection`
 *   (`false` → `true`; `true` is the default and is dropped).
 * - Transactions/Payouts/Reports/Disputes Overviews (the components that
 *   accept `dataCustomization`): the `list` sub-configuration is renamed to
 *   `dataGrid`, and `align` is removed from custom-column entries — V2 grids
 *   align columns internally (`flex`/`visibility` are unchanged; `details`
 *   never had it). Customizations and `fields` arrays referenced from a
 *   same-file declaration are migrated through that declaration, and grid
 *   customizations declared on their own are also reached through their type
 *   annotation (`const columns: PayoutsListCustomization = { ... }`, including
 *   `as`/`satisfies` forms). Values built in another file get a marker.
 * - List components except Reports: the `onRecordSelection` selection object
 *   renamed `showModal` to `showDetails` — destructured bindings, defaults
 *   and body references are renamed; handlers the codemod cannot rewrite
 *   (whole-selection parameters, handlers defined elsewhere) get a marker.
 *   Payouts Overview also renamed its `balanceAccountId` selection field to
 *   `id`, matching the other list components.
 * - Reports Overview: `onRecordSelection` removed (report rows are not
 *   selectable; the callback was never invoked in V1).
 * - Per-component `onError` is removed (migration marker: move it to the
 *   core-level `onError` option of AdyenPlatformExperience()).
 * - List components (Transactions/Payouts/Disputes/Reports/Pay by Link
 *   Overviews): `showDetails` and `onFiltersChanged` removed.
 * - Capital Overview: `onFundsRequest`, `onOfferDismiss`,
 *   `onOfferOptionsRequest`, `skipPreQualifiedIntro` removed.
 * - Capital Offer: `onOfferSelect`, `externalCapitalState` removed;
 *   `onOfferDismiss` renamed to `onDismiss`.
 * - Dispute Management: `onDisputeAccept`/`onDisputeDefend` renamed to
 *   `onAccept`/`onDefend`.
 * - Pay by Link Creation: `onCreationDismiss` renamed to `onDismiss`, and
 *   `onPaymentLinkCreated` renamed to `onCreate`.
 * - Pay by Link Overview: `balanceAccountId` removed (the component is
 *   store-scoped); the `paymentLinkCreation` and `paymentLinkSettings`
 *   sub-configurations are no longer public, so they are removed — a
 *   `paymentLinkSettings.storeIds` value is hoisted to the Overview top
 *   level first, and a marker names anything else they carried.
 * - Pay by Link Details: `onUpdate` removed (internal wiring).
 * - Pay by Link Settings: `settingsItems`, `embeddedInOverview` and
 *   `navigateBack` removed (internal wiring; `navigateBack` also left the
 *   standalone component, so the marker explains it).
 *
 * Component resolution covers direct imports, aliases, destructuring from
 * the UMD global (`AdyenPlatformExperienceWeb`), and same-file `const` objects
 * passed as the props argument. Migration-marker comments flag anything
 * that needs a manual decision; everything else is reported via api.report.
 */
function componentProps(file, api) {
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

    // Detect the file's quote style before any mutations — ast-types'
    // stringLiteral builder stamps double-quoted `extra.raw` on new nodes,
    // which would skew the detection after the fact.
    const quote = detectQuoteStyle(root, j);

    // Maps: local variable name → SDK component name.
    const aliasToComponent = new Map();
    // Maps: local variable name → ObjectExpression path from `const x = { ... }`.
    const objectDeclaratorPaths = new Map();
    // Maps: local variable name → ArrayExpression path from `const x = [ ... ]`.
    const arrayDeclaratorPaths = new Map();
    // Maps: local variable name → component, from `const x = new Comp({...})`.
    const instanceToComponent = new Map();

    /** Record `const x = Comp` / `const x = ns.Comp` component aliases. */
    function trackComponentAlias(id, init) {
        // const TransactionsOverview = Comp | ns.Comp
        let sourceName = null;
        if (init.type === 'Identifier') {
            sourceName = init.name;
        } else if (init.type === 'MemberExpression' && !init.computed && init.property.type === 'Identifier') {
            sourceName = init.property.name;
        }
        if (sourceName && isComponentName(sourceName)) {
            aliasToComponent.set(id.name, sourceName);
        }
    }

    /** Record component names destructured as `const { X } = ...`. */
    function trackDestructuredComponents(id) {
        for (const prop of id.properties || []) {
            if (prop.type !== 'ObjectProperty' || prop.computed) continue;
            const keyName = propKeyName(prop);
            if (!keyName || !isComponentName(keyName)) continue;
            const localName = prop.value.type === 'Identifier' ? prop.value.name : keyName;
            aliasToComponent.set(localName, keyName);
        }
    }

    /** Collect component aliases and same-file props objects from one declarator. */
    function trackDeclarator(path) {
        const { id, init } = path.node;
        if (!id) return;

        if (id.type === 'Identifier' && init) {
            trackComponentAlias(id, init);
            // const props = { ... } (usable as `new Comp(props)`) and the
            // objects/arrays that props and sub-configurations reference,
            // including `as`/`satisfies` wrapped literals.
            const valuePath = unwrapPath(path.get('init'));
            if (valuePath?.node?.type === 'ObjectExpression') {
                objectDeclaratorPaths.set(id.name, valuePath);
            } else if (valuePath?.node?.type === 'ArrayExpression') {
                arrayDeclaratorPaths.set(id.name, valuePath);
            }
        }

        // const { TransactionsOverview } = AdyenPlatformExperienceWeb | require(...) | import(...)
        if (id.type === 'ObjectPattern') {
            trackDestructuredComponents(id);
        }
    }

    root.find(j.VariableDeclarator).forEach(trackDeclarator);

    /** Resolve the component behind a `new` callee expression. */
    function calleeComponentName(callee) {
        if (callee.type === 'Identifier') {
            return aliasToComponent.get(callee.name) ?? (isComponentName(callee.name) ? callee.name : null);
        }
        if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
            // AdyenPlatformExperienceWeb.TransactionsOverview (UMD/CDN usage)
            return isComponentName(callee.property.name) ? callee.property.name : null;
        }
        return null;
    }

    /** Set appearance.titles, merging into an existing `appearance` object. */
    function mergeAppearanceTitles(objectPath, mode, anchor, componentName) {
        const obj = objectPath.node;
        const index = findPropIndex(obj, 'appearance');
        if (index === -1) {
            obj.properties.push(
                makeProp(j, 'appearance', j.objectExpression([makeProp(j, 'titles', j.stringLiteral(mode))]))
            );
            return;
        }
        const appearancePath = unwrapPath(objectPath.get('properties', index).get('value'));
        const appearance = appearancePath?.node;
        if (appearance?.type === 'ObjectExpression') {
            if (findPropIndex(appearance, 'titles') === -1) {
                appearance.properties.push(makeProp(j, 'titles', j.stringLiteral(mode)));
            } else {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: 'hideTitle: true' was dropped — 'appearance.titles' is already set and wins per field in V2. Verify this is what you want.`
                );
            }
            return;
        }
        addTodoComment(j, anchor, `${componentName}: 'hideTitle: true' was dropped — the existing 'appearance' value is dynamic; add titles: 'hidden' to it manually.`);
    }

    /** Apply the hideTitle → appearance.titles rule; returns true when the object changed. */
    function applyHideTitleRule(componentName, objectPath, anchor) {
        const obj = objectPath.node;
        const hideTitleIndex = findPropIndex(obj, data.HIDE_TITLE_PROP);
        if (hideTitleIndex === -1) return false;

        const propPath = objectPath.get('properties', hideTitleIndex);
        const value = booleanLiteralValue(unwrap(propPath.node.value));
        if (value === true) {
            j(propPath).remove();
            mergeAppearanceTitles(objectPath, 'hidden', anchor, componentName);
            notes.push(`${componentName}: replaced hideTitle: true with appearance: { titles: 'hidden' }`);
        } else if (value === false) {
            j(propPath).remove();
            notes.push(`${componentName}: removed hideTitle: false (titles are visible by default in V2)`);
        } else {
            j(propPath).remove();
            addTodoComment(
                j,
                anchor,
                `${componentName}: 'hideTitle' was removed. Its value was dynamic; migrate it manually to appearance: { titles: 'hidden' | 'visible' }.`
            );
        }
        return true;
    }

    /** Set one `pagination` field, merging into an existing `pagination` object. */
    function mergePaginationField(objectPath, field, valueNode, oldProp, anchor, componentName) {
        const obj = objectPath.node;
        const index = findPropIndex(obj, 'pagination');
        if (index === -1) {
            obj.properties.push(makeProp(j, 'pagination', j.objectExpression([makeProp(j, field, valueNode)])));
            return;
        }
        const paginationPath = unwrapPath(objectPath.get('properties', index).get('value'));
        const pagination = paginationPath?.node;
        if (pagination?.type === 'ObjectExpression') {
            if (findPropIndex(pagination, field) === -1) {
                pagination.properties.push(makeProp(j, field, valueNode));
            } else {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: '${oldProp}' was dropped — 'pagination.${field}' is already set and wins. Verify this is what you want.`
                );
            }
            return;
        }
        addTodoComment(j, anchor, `${componentName}: '${oldProp}' was dropped — the existing 'pagination' value is dynamic; add '${field}' to it manually.`);
    }

    /** Group the list components' pagination props into `pagination`; returns true when the object changed. */
    function applyPaginationRule(componentName, objectPath, anchor) {
        if (!data.PAGINATION_RULE.components.includes(componentName)) return false;
        const obj = objectPath.node;
        let changed = false;

        for (const [oldProp, { field, mode }] of Object.entries(data.PAGINATION_RULE.oldProps)) {
            const index = findPropIndex(obj, oldProp);
            if (index === -1) continue;

            const propPath = objectPath.get('properties', index);
            const value = unwrap(propPath.node.value);
            j(propPath).remove();
            changed = true;

            if (mode === 'move') {
                // The value is carried over as-is, so dynamic values are fine.
                mergePaginationField(objectPath, field, value, oldProp, anchor, componentName);
                notes.push(`${componentName}: moved '${oldProp}' into 'pagination.${field}'`);
            } else {
                // mode === 'invert': V2 flips the polarity of the boolean.
                const boolean = booleanLiteralValue(value);
                if (boolean === false) {
                    mergePaginationField(objectPath, field, j.booleanLiteral(true), oldProp, anchor, componentName);
                    notes.push(`${componentName}: replaced '${oldProp}: false' with 'pagination.${field}: true'`);
                } else if (boolean === true) {
                    notes.push(`${componentName}: removed '${oldProp}: true' (limit selection is enabled by default in V2)`);
                } else {
                    addTodoComment(
                        j,
                        anchor,
                        `${componentName}: '${oldProp}' was removed. Its value was dynamic; set 'pagination.${field}' to its negation manually.`
                    );
                }
            }
        }
        return changed;
    }

    /** Remove the per-component removed props; returns true when the object changed. */
    function removeComponentProps(componentName, objectPath, anchor) {
        const obj = objectPath.node;
        let changed = false;
        const removedMap = data.REMOVED_PROPS[componentName] || {};
        for (const propName of Object.keys(removedMap)) {
            const index = findPropIndex(obj, propName);
            if (index === -1) continue;
            const value = unwrap(obj.properties[index].value);
            j(objectPath.get('properties', index)).remove();
            changed = true;
            if (propName === 'showDetails' && booleanLiteralValue(value) === false && findPropIndex(obj, 'onRecordSelection') === -1) {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: 'showDetails: false' has no direct V2 equivalent — the built-in details view now opens by default on record selection. Provide onRecordSelection ({ id, showDetails }) to take over selection.`
                );
            } else {
                notes.push(`${componentName}: removed '${propName}' (${removedMap[propName]})`);
            }
        }
        return changed;
    }

    /** Remove the globally removed props (per-component onError); returns true when the object changed. */
    function removeGlobalProps(componentName, objectPath, anchor) {
        const obj = objectPath.node;
        let changed = false;
        for (const [propName, reason] of Object.entries(data.GLOBAL_REMOVED_PROPS)) {
            const index = findPropIndex(obj, propName);
            if (index === -1) continue;
            j(objectPath.get('properties', index)).remove();
            addTodoComment(j, anchor, `${componentName}: per-component '${propName}' no longer takes effect in V2 — ${reason}.`);
            changed = true;
        }
        return changed;
    }

    /** Apply the per-component prop renames; returns true when the object changed. */
    function renameComponentProps(componentName, objectPath, anchor) {
        const obj = objectPath.node;
        let changed = false;
        const renameMap = data.RENAMED_PROPS[componentName] || {};
        for (const [oldName, newName] of Object.entries(renameMap)) {
            const index = findPropIndex(obj, oldName);
            if (index === -1) continue;
            if (findPropIndex(obj, newName) !== -1) {
                j(objectPath.get('properties', index)).remove();
                addTodoComment(j, anchor, `${componentName}: dropped '${oldName}' — renamed to '${newName}', which is already provided.`);
            } else {
                obj.properties[index].key = j.identifier(newName);
                notes.push(`${componentName}: renamed '${oldName}' → '${newName}'`);
            }
            changed = true;
        }
        return changed;
    }

    /** Apply one sub-configuration's renames; returns true when the sub-object changed. */
    function renameSubconfigProps({ componentName, subName, rules, subObj, subObjectPath, subPropPath }) {
        let changed = false;
        for (const [oldName, newName] of Object.entries(rules.renames || {})) {
            const renameIndex = findPropIndex(subObj, oldName);
            if (renameIndex === -1) continue;
            if (findPropIndex(subObj, newName) !== -1) {
                j(subObjectPath.get('properties', renameIndex)).remove();
                addTodoComment(j, subPropPath.node, `${subName}.${oldName} was dropped — renamed to ${subName}.${newName}, which is already provided.`);
            } else {
                subObj.properties[renameIndex].key = j.identifier(newName);
                notes.push(`${componentName}: renamed '${subName}.${oldName}' → '${subName}.${newName}'`);
            }
            changed = true;
        }
        return changed;
    }

    /** Remove one sub-configuration's removed props, hoisting where configured; returns true when the component object changed. */
    function removeSubconfigProps({ componentName, subName, rules, obj, subObj, subObjectPath, anchor }) {
        let changed = false;
        for (const [propName, reason] of Object.entries(rules.removedProps || {})) {
            const propIndex = findPropIndex(subObj, propName);
            if (propIndex === -1) continue;
            const propNode = subObj.properties[propIndex];
            const propValue = propNode.value;
            j(subObjectPath.get('properties', propIndex)).remove();
            changed = true;

            const hoistTo = rules.hoistToProps?.[propName];
            if (hoistTo && findPropIndex(obj, hoistTo) === -1) {
                obj.properties.push(makeProp(j, hoistTo, propValue));
                notes.push(`${componentName}: hoisted '${subName}.${propName}' to the component top level as '${hoistTo}'`);
            } else if (hoistTo) {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: '${subName}.${propName}' was removed (${reason}); the component already sets '${hoistTo}' — verify that value still applies.`
                );
            } else {
                notes.push(`${componentName}: removed '${subName}.${propName}' (${reason})`);
            }
        }
        return changed;
    }

    /** Flag a sub-configuration's now-required props that are missing. */
    function requireSubconfigProps({ subName, rules, subObj, subPropPath }) {
        for (const requiredProp of rules.requiredProps || []) {
            if (findPropIndex(subObj, requiredProp) === -1) {
                addTodoComment(j, subPropPath.node, `${subName} now requires '${requiredProp}' — add it manually (it cannot be inferred).`);
            }
        }
    }

    /** The object literal behind a value, resolving same-file `const x = { ... }` references. */
    function resolveObjectPath(valuePath) {
        const path = unwrapPath(valuePath);
        const node = path?.node;
        if (node?.type === 'ObjectExpression') return path;
        if (node?.type === 'Identifier') return objectDeclaratorPaths.get(node.name) ?? null;
        return null;
    }

    /** The array literal behind a value, resolving same-file `const x = [ ... ]` references. */
    function resolveArrayPath(valuePath) {
        const path = unwrapPath(valuePath);
        const node = path?.node;
        if (node?.type === 'ArrayExpression') return path;
        if (node?.type === 'Identifier') return arrayDeclaratorPaths.get(node.name) ?? null;
        return null;
    }

    /** Apply the sub-configuration rules (paymentLinkCreation / paymentLinkSettings); returns true when the object changed. */
    function applySubconfigRules(componentName, objectPath, anchor) {
        const obj = objectPath.node;
        const subRules = data.SUBCONFIG_RULES[componentName];
        if (!subRules) return false;

        let changed = false;
        for (const [subName, rules] of Object.entries(subRules)) {
            const index = findPropIndex(obj, subName);
            if (index === -1) continue;
            const subPropPath = objectPath.get('properties', index);
            const subObjectPath = resolveObjectPath(subPropPath.get('value'));
            const subObj = subObjectPath?.node;
            if (subObj?.type !== 'ObjectExpression') {
                // Built elsewhere (imported, factory call): the V2 changes
                // cannot be verified, so flag instead of silently skipping.
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: '${subName}' is not an object literal in this file, so its V2 changes (${describeSubconfigChanges(rules)}) could not be applied — migrate it manually if it is still on the V1 shape.`
                );
                changed = true;
                continue;
            }

            const sub = { componentName, subName, rules, obj, subObj, subObjectPath, subPropPath, anchor };
            if (renameSubconfigProps(sub)) changed = true;
            if (removeSubconfigProps(sub)) changed = true;
            requireSubconfigProps(sub);
        }
        return changed;
    }

    /**
     * Move a sub-configuration's props that have a V2 top-level home up to the
     * parent object, so removing the sub-configuration does not lose them. A
     * value the parent already sets cannot be hoisted, so it is flagged.
     */
    function hoistSubconfigProps(componentName, subName, sub, obj, anchor) {
        for (const [propName, hoistTo] of Object.entries(sub.rules.hoistToProps || {})) {
            const propIndex = findPropIndex(sub.subObj, propName);
            if (propIndex === -1) continue;

            const propValue = sub.subObj.properties[propIndex].value;
            j(sub.subObjectPath.get('properties', propIndex)).remove();

            if (findPropIndex(obj, hoistTo) === -1) {
                obj.properties.push(makeProp(j, hoistTo, propValue));
                notes.push(`${componentName}: hoisted '${subName}.${propName}' to the top level as '${hoistTo}'`);
            } else {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: '${subName}.${propName}' was dropped — the component already sets '${hoistTo}'; verify that value still applies.`
                );
            }
        }
    }

    /**
     * Remove sub-configurations that are no longer public (see
     * REMOVED_SUBCONFIGS). Values with a V2 top-level home are hoisted before
     * the sub-configuration goes away, so they are not lost; anything else it
     * carried is named in a marker, because dropping it changes behaviour.
     */
    function removeSubconfigs(componentName, objectPath, anchor) {
        const subRules = data.REMOVED_SUBCONFIGS[componentName];
        if (!subRules) return false;

        const obj = objectPath.node;
        let changed = false;
        for (const [subName, rules] of Object.entries(subRules)) {
            const index = findPropIndex(obj, subName);
            if (index === -1) continue;

            const subPropPath = objectPath.get('properties', index);
            const subObjectPath = resolveObjectPath(subPropPath.get('value'));
            const subObj = subObjectPath?.node;

            if (subObj?.type === 'ObjectExpression') {
                hoistSubconfigProps(componentName, subName, { rules, subObj, subObjectPath }, obj, anchor);
            }

            // Read after hoisting, so a preserved value is not reported as lost.
            const detail = describeDroppedSubconfig(subObj);

            j(subPropPath).remove();
            changed = true;

            addTodoComment(j, anchor, `${componentName}: '${subName}' is no longer a public prop — ${rules.reason}.${detail}`);
            notes.push(`${componentName}: removed '${subName}' (${rules.reason})`);
        }
        return changed;
    }

    /** Remove the removed props from one `fields` array of custom-column entries; returns true when anything changed. */
    function removeRemovedColumnProps(context, fieldsPath) {
        let changed = false;
        const elements = fieldsPath.node.elements || [];
        for (let index = 0; index < elements.length; index++) {
            const entryPath = unwrapPath(fieldsPath.get('elements', index));
            const entry = entryPath?.node;
            if (entry?.type !== 'ObjectExpression') continue;
            for (const [propName, reason] of Object.entries(data.COLUMN_REMOVED_PROPS.removedProps)) {
                const propIndex = findPropIndex(entry, propName);
                if (propIndex === -1) continue;
                j(entryPath.get('properties', propIndex)).remove();
                notes.push(`${context}: removed '${propName}' from a column entry (${reason})`);
                changed = true;
            }
        }
        return changed;
    }

    /** Flag column entries the codemod cannot reach; returns true (it always marks the call site). */
    function flagUnreachableColumns(context, anchor) {
        const removed = Object.keys(data.COLUMN_REMOVED_PROPS.removedProps);
        addTodoComment(
            j,
            anchor,
            `${context} is not a literal in this file, so '${removed.join("', '")}' could not be removed from its column entries — delete ${removed.length === 1 ? 'it' : 'them'} manually (V2 grids align columns internally).`
        );
        return true;
    }

    /**
     * Remove the removed column props from one `dataCustomization` sub-configuration;
     * returns true when anything changed. Values that are not literals in this file are
     * flagged, because their entries cannot be reached.
     */
    function applyColumnRemovedPropsToSubconfig(context, subPath, anchor) {
        if (subPath?.node?.type !== 'ObjectExpression') {
            return flagUnreachableColumns(context, anchor);
        }

        const fieldsIndex = findPropIndex(subPath.node, 'fields');
        if (fieldsIndex === -1) return false;

        const fieldsPath = resolveArrayPath(subPath.get('properties', fieldsIndex).get('value'));
        if (fieldsPath?.node?.type !== 'ArrayExpression') {
            return flagUnreachableColumns(`${context}.fields`, anchor);
        }

        return removeRemovedColumnProps(context, fieldsPath);
    }

    /** Remove the removed props from custom-column entries inside `dataCustomization`; returns true when anything changed. */
    function applyColumnRemovedProps(componentName, objectPath, anchor) {
        const index = findPropIndex(objectPath.node, 'dataCustomization');
        if (index === -1) return false;
        const dataCustomizationPath = resolveObjectPath(objectPath.get('properties', index).get('value'));
        if (dataCustomizationPath?.node?.type !== 'ObjectExpression') {
            // The sub-configuration rules flag the same prop for the key
            // rename; this names the removed column props specifically.
            return flagUnreachableColumns(`${componentName} dataCustomization`, anchor);
        }

        let changed = false;
        for (const subName of data.COLUMN_REMOVED_PROPS.subConfigs) {
            const subIndex = findPropIndex(dataCustomizationPath.node, subName);
            if (subIndex === -1) continue;
            const context = `${componentName} dataCustomization.${subName}`;
            const subPath = resolveObjectPath(dataCustomizationPath.get('properties', subIndex).get('value'));
            if (applyColumnRemovedPropsToSubconfig(context, subPath, anchor)) changed = true;
        }
        return changed;
    }

    /** Collect the callback-body references that resolve to the `oldName` binding. */
    function collectBindingReferences(fnPath, oldName, patternNodes) {
        const refs = [];
        j(fnPath)
            .find(j.Identifier, { name: oldName })
            .forEach(refPath => {
                const node = refPath.node;
                if (patternNodes.has(node)) return;
                const parent = refPath.parent?.node;
                if (!parent) return;
                // Property keys and non-computed member properties are not
                // references to the binding.
                if (
                    ((parent.type === 'MemberExpression' || parent.type === 'OptionalMemberExpression') &&
                        !parent.computed &&
                        parent.property === node) ||
                    ((parent.type === 'ObjectProperty' || parent.type === 'Property') && !parent.computed && !parent.shorthand && parent.key === node)
                ) {
                    return;
                }
                // Only occurrences that resolve to the callback's own scope are
                // the destructured binding; nested redeclarations keep theirs.
                if (refPath.scope?.lookup(oldName) !== fnPath.scope) return;
                refs.push({ parent, node });
            });
        return refs;
    }

    /** Rename the collected references (object shorthand keeps its key). */
    function renameCollectedReferences(refs, newName) {
        for (const { parent, node } of refs) {
            if (parent.type === 'ObjectProperty' || parent.type === 'Property') {
                parent.shorthand = false;
                parent.value = j.identifier(newName);
            } else {
                node.name = newName;
            }
        }
    }

    /** Flag a handler that takes the whole selection object; returns true when flagged. */
    function flagWholeSelectionHandler(componentName, propName, fnPath, fieldRenames, anchor) {
        if (!mentionsAnyField(fnPath, fieldRenames)) return false;
        addTodoComment(
            j,
            anchor,
            `${componentName}: '${propName}'s selection object renamed ${describeFieldRenames(fieldRenames)} in V2 — this handler takes the selection as a whole; rename its old-field references manually.`
        );
        return true;
    }

    /** True when the callback subtree mentions any of the renamed field names. */
    function mentionsAnyField(fnPath, fieldRenames) {
        return Object.keys(fieldRenames).some(oldField => j(fnPath).find(j.Identifier, { name: oldField }).size() > 0);
    }

    /** Rename one callback's destructured selection fields (key, binding, references); returns true when the callback changed. */
    function renameCallbackFields(componentName, propName, fnPath, fieldRenames, anchor) {
        const paramPath = fnPath.get('params', 0);
        const param = paramPath?.node;
        if (param?.type !== 'ObjectPattern') {
            return flagWholeSelectionHandler(componentName, propName, fnPath, fieldRenames, anchor);
        }

        let changed = false;
        for (const [oldField, newField] of Object.entries(fieldRenames)) {
            const propIndex = findPatternPropIndex(param, oldField);
            if (propIndex === -1) continue;
            const patternProp = param.properties[propIndex];
            const bindingName = patternBindingName(patternProp);

            if (findPatternPropIndex(param, newField) !== -1) {
                j(paramPath.get('properties', propIndex)).remove();
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: dropped '${oldField}' from the '${propName}' selection destructuring — '${newField}' is already destructured and wins. Verify this is what you want.`
                );
            } else if (bindingName !== oldField) {
                // Aliased (or nested) destructuring: only the source key changes,
                // so the local binding keeps working untouched.
                patternProp.key = j.identifier(newField);
                notes.push(
                    `${componentName}: renamed the '${propName}' selection field '${oldField}' → '${newField}'` +
                        (bindingName ? ` (still bound as '${bindingName}')` : ' (the local binding is unchanged)')
                );
            } else {
                // The binding shares the old field's name: rename key, binding,
                // and every reference that resolves to it. References are
                // collected first — once the destructuring is rewritten the old
                // binding is gone and scope lookups would miss them.
                const patternNodes = new Set([patternProp.key, patternProp.value, patternProp.value?.left]);
                const refs = collectBindingReferences(fnPath, oldField, patternNodes);
                patternProp.key = j.identifier(newField);
                if (patternProp.value.type === 'AssignmentPattern') {
                    // `{ showModal = fallback }` — keep the default, rename the binding.
                    patternProp.value.left = j.identifier(newField);
                } else {
                    patternProp.value = j.identifier(newField);
                    patternProp.shorthand = true;
                }
                renameCollectedReferences(refs, newField);
                notes.push(`${componentName}: renamed the '${propName}' selection field '${oldField}' → '${newField}' (and its references)`);
            }
            changed = true;
        }
        return changed;
    }

    /** Apply the callback selection-field renames (`onRecordSelection`); returns true when something changed. */
    function applyCallbackFieldRenames(componentName, objectPath, anchor) {
        const renamesByProp = data.CALLBACK_FIELD_RENAMES[componentName] || {};
        let changed = false;
        for (const [propName, fieldRenames] of Object.entries(renamesByProp)) {
            const index = findPropIndex(objectPath.node, propName);
            if (index === -1) continue;
            const fnPath = unwrapPath(objectPath.get('properties', index).get('value'));
            const fn = fnPath?.node;
            if (fn?.type === 'ArrowFunctionExpression' || fn?.type === 'FunctionExpression') {
                if (renameCallbackFields(componentName, propName, fnPath, fieldRenames, anchor)) changed = true;
            } else if (fn?.type === 'Identifier' || fn?.type === 'MemberExpression') {
                addTodoComment(
                    j,
                    anchor,
                    `${componentName}: '${propName}'s selection object renamed ${describeFieldRenames(fieldRenames)} in V2 — the handler is defined elsewhere; update its selection destructuring manually.`
                );
                changed = true;
            }
        }
        return changed;
    }

    /** Apply rules for one component's props object (given as a path). */
    function applyComponentRules(componentName, objectPath, anchor) {
        let changed = false;
        if (applyHideTitleRule(componentName, objectPath, anchor)) changed = true;
        if (applyPaginationRule(componentName, objectPath, anchor)) changed = true;
        if (removeComponentProps(componentName, objectPath, anchor)) changed = true;
        if (removeGlobalProps(componentName, objectPath, anchor)) changed = true;
        if (renameComponentProps(componentName, objectPath, anchor)) changed = true;
        if (applySubconfigRules(componentName, objectPath, anchor)) changed = true;
        if (removeSubconfigs(componentName, objectPath, anchor)) changed = true;
        if (applyColumnRemovedProps(componentName, objectPath, anchor)) changed = true;
        if (applyCallbackFieldRenames(componentName, objectPath, anchor)) changed = true;
        return changed;
    }

    /** Apply rules to an options argument path (object or identifier to a same-file object). */
    function applyToOptionsArg(componentName, argPath, anchor) {
        const optionsPath = unwrapPath(argPath);
        if (!optionsPath) return false;
        if (optionsPath.node.type === 'ObjectExpression') {
            return applyComponentRules(componentName, optionsPath, anchor);
        }
        if (optionsPath.node.type === 'Identifier' && objectDeclaratorPaths.has(optionsPath.node.name)) {
            return applyComponentRules(componentName, objectDeclaratorPaths.get(optionsPath.node.name), anchor);
        }
        return false;
    }

    // `const columns: PayoutsListCustomization = { fields: [ ... ] }` — grid
    // customizations declared on their own, including ones exported for use in
    // another file. Their type annotation identifies the shape, so the column
    // entries can be cleaned up without resolving which component receives
    // them (the ones referenced from a call site in this file are also reached
    // through that call site).
    root.find(j.VariableDeclarator).forEach(path => {
        const typeName = declaredTypeName(path.node);
        if (!typeName || !data.COLUMN_CUSTOMIZATION_TYPES.includes(typeName)) return;
        const customizationPath = resolveObjectPath(path.get('init'));
        if (customizationPath?.node?.type !== 'ObjectExpression') return;
        const fieldsIndex = findPropIndex(customizationPath.node, 'fields');
        if (fieldsIndex === -1) return;
        const fieldsPath = resolveArrayPath(customizationPath.get('properties', fieldsIndex).get('value'));
        if (fieldsPath?.node?.type !== 'ArrayExpression') {
            flagUnreachableColumns(`${typeName}.fields`, statementAnchor(path));
            mutated = true;
            return;
        }
        if (removeRemovedColumnProps(typeName, fieldsPath)) mutated = true;
    });

    // `new <Component>({ ... })`
    root.find(j.NewExpression).forEach(path => {
        const componentName = calleeComponentName(path.node.callee);
        if (!componentName) return;

        // Track the instance variable for later `.update({ ... })` calls.
        const declarator = path.parent?.node.type === 'VariableDeclarator' ? path.parent.node : null;
        if (declarator?.id.type === 'Identifier') {
            instanceToComponent.set(declarator.id.name, componentName);
        }

        const firstArg = (path.node.arguments || [])[0];
        if (firstArg && applyToOptionsArg(componentName, path.get('arguments', 0), statementAnchor(path))) {
            mutated = true;
        }
    });

    // `<instance>.update({ ... })` — receivers constructed in this file get
    // their component's rules; unattributed receivers (constructed in another
    // file, indirect references) are flagged when they set props that changed
    // in V2, since which rules apply depends on the component.
    root.find(j.CallExpression).forEach(path => {
        const callee = path.node.callee;
        if (
            callee?.type !== 'MemberExpression' ||
            callee.computed ||
            callee.property.type !== 'Identifier' ||
            callee.property.name !== 'update'
        ) {
            return;
        }
        const firstArg = (path.node.arguments || [])[0];
        if (!firstArg) return;

        const componentName =
            callee.object.type === 'Identifier' ? instanceToComponent.get(callee.object.name) : undefined;
        if (componentName) {
            if (applyToOptionsArg(componentName, path.get('arguments', 0), statementAnchor(path))) {
                mutated = true;
            }
            return;
        }

        // Unattributed receiver: comment-only flag, nothing is modified.
        const optionsPath = unwrapPath(path.get('arguments', 0));
        let objNode = null;
        if (optionsPath?.node.type === 'ObjectExpression') {
            objNode = optionsPath.node;
        } else if (
            optionsPath?.node.type === 'Identifier' &&
            objectDeclaratorPaths.has(optionsPath.node.name)
        ) {
            objNode = objectDeclaratorPaths.get(optionsPath.node.name).node;
        }
        if (objNode?.type !== 'ObjectExpression') return;

        const staleProps = (objNode.properties || [])
            .filter(
                prop =>
                    (prop.type === 'ObjectProperty' || prop.type === 'Property') &&
                    data.V1_ONLY_PROP_KEYS.includes(propKeyName(prop))
            )
            .map(prop => propKeyName(prop));
        if (staleProps.length === 0) return;

        addTodoComment(
            j,
            statementAnchor(path),
            `this .update() call sets '${staleProps.join("', '")}', which ${staleProps.length === 1 ? 'was' : 'were'} removed or renamed for at least one component in V2, and the component behind '${describeReceiver(callee.object)}' could not be identified (it was not constructed in this file) — check that component's V2 props and migrate manually.`
        );
        notes.push(`flagged unattributed .update() setting: ${staleProps.join(', ')}`);
        mutated = true;
    });

    report(api, file, notes);

    return mutated ? root.toSource({ quote }) : undefined;
}

module.exports = withSfcSupport(componentProps);
module.exports.parser = 'tsx';
