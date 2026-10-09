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

/**
 * V1 → V2 codemod: component prop changes on `new <Component>({ ... })`
 * construction and `<instance>.update({ ... })` calls.
 *
 * What it does (per docs/v2/v1-to-v2-migration-guide.md):
 * - `hideTitle: true`  → `appearance: { titles: 'hidden' }` (merged into an
 *   existing `appearance` object when present); `hideTitle: false` is dropped.
 * - Per-component `onError` is removed (migration marker: move it to the
 *   core-level `onError` option of AdyenPlatformExperience()).
 * - List components (Transactions/Payouts/Disputes/Reports/Pay by Link
 *   Overviews): `showDetails` and `onFiltersChanged` removed.
 * - Capital Overview: `onFundsRequest`, `onOfferDismiss`,
 *   `onOfferOptionsRequest`, `skipPreQualifiedIntro` removed.
 * - Capital Offer: `onOfferSelect`, `externalCapitalState` removed.
 * - Pay by Link Creation and the `paymentLinkCreation` sub-configuration:
 *   `onCreationDismiss` renamed to `onDismiss`.
 * - `paymentLinkSettings`: `hideTitle`/`storeIds` removed; `storeIds` is
 *   hoisted to the Overview top level when safe; a migration marker is
 *   added when the now-required `onDismiss` callback is missing.
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
            // const props = { ... } (usable as `new Comp(props)`)
            if (init.type === 'ObjectExpression') {
                objectDeclaratorPaths.set(id.name, path.get('init'));
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
                    `${componentName}: 'showDetails: false' has no direct V2 equivalent — the built-in details view now opens by default on record selection. Provide onRecordSelection ({ id, showModal }) to take over selection.`
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
            const subObjectPath = unwrapPath(subPropPath.get('value'));
            const subObj = subObjectPath?.node;
            if (subObj?.type !== 'ObjectExpression') continue;

            const sub = { componentName, subName, rules, obj, subObj, subObjectPath, subPropPath, anchor };
            if (renameSubconfigProps(sub)) changed = true;
            if (removeSubconfigProps(sub)) changed = true;
            requireSubconfigProps(sub);
        }
        return changed;
    }

    /** Apply rules for one component's props object (given as a path). */
    function applyComponentRules(componentName, objectPath, anchor) {
        let changed = false;
        if (applyHideTitleRule(componentName, objectPath, anchor)) changed = true;
        if (removeComponentProps(componentName, objectPath, anchor)) changed = true;
        if (removeGlobalProps(componentName, objectPath, anchor)) changed = true;
        if (renameComponentProps(componentName, objectPath, anchor)) changed = true;
        if (applySubconfigRules(componentName, objectPath, anchor)) changed = true;
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
