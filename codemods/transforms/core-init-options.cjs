'use strict';

const { withSfcSupport } = require('../lib/sfc.cjs');
const { unwrapPath, findPropIndex, detectQuoteStyle, report } = require('../lib/ast-utils.cjs');

/** True when the callee initializes the library (direct or UMD form). */
const isInitCallee = callee => {
    if (callee.type === 'Identifier') return callee.name === 'AdyenPlatformExperience';
    if (callee.type === 'MemberExpression' && !callee.computed && callee.property.type === 'Identifier') {
        // AdyenPlatformExperienceWeb.AdyenPlatformExperience (UMD/CDN usage)
        return callee.property.name === 'AdyenPlatformExperience';
    }
    return false;
};

/**
 * V1 → V2 codemod: library initialization options.
 *
 * Removes the deprecated `availableTranslations` option from
 * `AdyenPlatformExperience({ ... })` calls (and the equivalent
 * `AdyenPlatformExperienceWeb.AdyenPlatformExperience(...)` UMD form).
 * All supported locales are resolved automatically in V2.
 */
function coreInitOptions(file, api) {
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

    root.find(j.CallExpression).forEach(path => {
        if (!isInitCallee(path.node.callee)) return;
        if ((path.node.arguments || []).length === 0) return;

        const optionsPath = unwrapPath(path.get('arguments', 0));
        if (optionsPath?.node.type !== 'ObjectExpression') return;

        const index = findPropIndex(optionsPath.node, 'availableTranslations');
        if (index === -1) return;

        j(optionsPath.get('properties', index)).remove();
        notes.push('removed the deprecated availableTranslations option (all supported locales resolve automatically in V2)');
        mutated = true;
    });

    report(api, file, notes);

    return mutated ? root.toSource({ quote }) : undefined;
}

module.exports = withSfcSupport(coreInitOptions);
module.exports.parser = 'tsx';
