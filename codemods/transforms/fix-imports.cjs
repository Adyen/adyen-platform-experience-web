'use strict';

const data = require('../lib/component-data.cjs');
const { withSfcSupport } = require('../lib/sfc.cjs');
const {
    propKeyName,
    addTodoComment,
    statementAnchor,
    detectQuoteStyle,
    report,
} = require('../lib/ast-utils.cjs');

/** True when the node is a string literal naming the SDK package. */
const isPackageSource = node =>
    (node.type === 'StringLiteral' || node.type === 'Literal') && node.value === data.PACKAGE_NAME;

/**
 * V1 → V2 codemod: TypeScript import fixes for
 * `@adyen/adyen-platform-experience-web`.
 *
 * - Renames V1 type names that still exist in V2 under a new name
 *   (e.g. `TransactionsOverviewComponentProps` → `TransactionsOverviewProps`,
 *   `ExternalCapitalState` → `CapitalState`, `onErrorHandler` → `ErrorHandler`),
 *   updating the import and every reference in the file.
 * - Handles the names V2 no longer publishes (Core, Localization, the http
 *   helpers, Assets, AuthSession, Analytics, the environment constants, the
 *   domain types and runtime enums):
 *     - still referenced in the file → kept, with a migration-marker comment
 *       on the import (removing it would only move the compile error away
 *       from the thing that needs deciding);
 *     - not referenced → removed (the import itself goes away when empty).
 *
 * Works for ESM `import { ... } from '...'`, `require('...')` destructuring,
 * and dynamic `import('...')` destructuring.
 */
function fixImports(file, api) {
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

    /** True when `name` is referenced outside imports/destructuring bindings. */
    function isReferenced(name) {
        let found = false;
        root.find(j.Identifier, { name }).forEach(path => {
            if (found) return;
            const parent = path.parent;
            if (!parent) return;
            const type = parent.node.type;
            // Import specifiers are not references.
            if (type === 'ImportSpecifier' || type === 'ImportDefaultSpecifier' || type === 'ImportNamespaceSpecifier') return;
            // Keys/values inside require/import destructuring patterns are the
            // binding itself, not references (includes shorthand properties).
            if (type === 'ObjectProperty' && parent.parent?.node.type === 'ObjectPattern') return;
            found = true;
        });
        return found;
    }

    /** Rename every reference of `oldName` to `newName`. */
    function renameReferences(oldName, newName) {
        root.find(j.Identifier, { name: oldName }).forEach(path => {
            path.node.name = newName;
        });
    }

    /**
     * Process one binding (import specifier or destructure property).
     * Returns 'renamed', 'kept' (removed name, still referenced), 'removed',
     * or 'untouched'.
     */
    function processBinding(importedName, localName, replaceLocal) {
        if (data.TYPE_RENAMES[importedName]) {
            const newName = data.TYPE_RENAMES[importedName];
            if (localName === importedName) {
                // Not aliased: rename the binding and every reference.
                renameReferences(localName, newName);
                replaceLocal(newName, newName);
                notes.push(`renamed '${importedName}' → '${newName}' (import and references)`);
            } else {
                // Aliased (import { X as Y }): only the imported name changes.
                replaceLocal(localName, newName);
                notes.push(`renamed imported name '${importedName}' → '${newName}' (local alias '${localName}' kept)`);
            }
            return 'renamed';
        }

        if (data.REMOVED_EXPORTS.includes(importedName)) {
            return isReferenced(localName) ? 'kept' : 'removed';
        }

        return 'untouched';
    }

    // --- ESM imports ------------------------------------------------------------

    root.find(j.ImportDeclaration).forEach(declarationPath => {
        const declaration = declarationPath.node;
        if (!isPackageSource(declaration.source)) return;

        const keptForManualFix = [];
        let touched = false;

        declarationPath.get('specifiers').each(specifierPath => {
            const specifier = specifierPath.node;
            if (specifier.type !== 'ImportSpecifier') return;
            let importedName = null;
            if (specifier.imported.type === 'Identifier') {
                importedName = specifier.imported.name;
            } else if (specifier.imported.type === 'StringLiteral') {
                importedName = specifier.imported.value;
            }
            const localName = specifier.local ? specifier.local.name : importedName;

            const outcome = processBinding(importedName, localName, (newLocal, newImported) => {
                specifier.local = j.identifier(newLocal);
                specifier.imported = j.identifier(newImported);
            });

            if (outcome === 'renamed') {
                touched = true;
            } else if (outcome === 'removed') {
                j(specifierPath).remove();
                notes.push(`removed import of '${importedName}' (no longer published in V2)`);
                touched = true;
            } else if (outcome === 'kept') {
                keptForManualFix.push(importedName);
            }
        });

        if (keptForManualFix.length > 0) {
            addTodoComment(
                j,
                declaration,
                `'${keptForManualFix.join("', '")}' ${keptForManualFix.length === 1 ? 'is' : 'are'} no longer exported by ${data.PACKAGE_NAME} in V2 but still used in this file — replace or inline the implementation manually, then remove from this import.`
            );
            touched = true;
        }

        if (touched && declaration.specifiers.length === 0 && keptForManualFix.length === 0) {
            // Whole import was dead weight: drop the declaration entirely.
            j(declarationPath).remove();
        }

        mutated = mutated || touched;
    });

    // --- require(...) / dynamic import(...) destructuring -----------------------

    root.find(j.VariableDeclarator).forEach(declaratorPath => {
        const { id, init } = declaratorPath.node;
        if (id?.type !== 'ObjectPattern' || !init) return;

        let call = init;
        if (init.type === 'AwaitExpression') call = init.argument;
        if (call?.type !== 'CallExpression') return;

        const isRequire = call.callee.type === 'Identifier' && call.callee.name === 'require';
        const isDynamicImport = call.callee.type === 'Import';
        if (!isRequire && !isDynamicImport) return;
        if (!call.arguments || !isPackageSource(call.arguments[0])) return;

        const keptForManualFix = [];
        let touched = false;

        const patternPath = declaratorPath.get('id');
        patternPath.get('properties').each(propPath => {
            const prop = propPath.node;
            if (prop.type !== 'ObjectProperty' || prop.computed) return;
            const importedName = propKeyName(prop);
            if (!importedName) return;
            const localName = prop.value?.type === 'Identifier' ? prop.value.name : importedName;

            const outcome = processBinding(importedName, localName, (newLocal, newImported) => {
                prop.value = j.identifier(newLocal);
                prop.key = j.identifier(newImported);
            });

            if (outcome === 'renamed') {
                touched = true;
            } else if (outcome === 'removed') {
                j(propPath).remove();
                notes.push(`removed require/import binding of '${importedName}' (no longer published in V2)`);
                touched = true;
            } else if (outcome === 'kept') {
                keptForManualFix.push(importedName);
            }
        });

        if (keptForManualFix.length > 0) {
            addTodoComment(
                j,
                statementAnchor(declaratorPath),
                `'${keptForManualFix.join("', '")}' ${keptForManualFix.length === 1 ? 'is' : 'are'} no longer exported by ${data.PACKAGE_NAME} in V2 but still used in this file — replace or inline the implementation manually, then remove from this destructuring.`
            );
            touched = true;
        }

        if (touched && (id.properties || []).length === 0 && keptForManualFix.length === 0) {
            j(declaratorPath).remove();
        }

        mutated = mutated || touched;
    });

    report(api, file, notes);

    return mutated ? root.toSource({ quote }) : undefined;
}

module.exports = withSfcSupport(fixImports);
module.exports.parser = 'tsx';
