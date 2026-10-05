'use strict';

/**
 * Shared AST helpers for the V1 → V2 codemods.
 *
 * These codemods force the 'tsx' parser (see `exports.parser` on each
 * transform), so the AST follows ast-types' babel-core definitions:
 * object literal members are `ObjectProperty` nodes. Helpers below
 * still tolerate the estree `Property` node type for robustness.
 */

const TODO_TAG = 'TODO(v2-migration)';

// Node types that can wrap an object argument in TS (`{...} as Props`,
// `{...} satisfies Props`, `props!`).
const UNWRAPPABLE_TYPES = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSNonNullExpression']);

/** Unwrap TS `as`/`satisfies` expressions around object arguments (node level). */
function unwrap(node) {
    while (node && UNWRAPPABLE_TYPES.has(node.type)) {
        node = node.expression;
    }
    return node;
}

/** Unwrap TS `as`/`satisfies` expressions around an argument (path level). */
function unwrapPath(path) {
    let current = path;
    while (current && UNWRAPPABLE_TYPES.has(current.node.type)) {
        current = current.get('expression');
    }
    return current;
}

/** Static name of an object property key, or null when computed/dynamic. */
function propKeyName(prop) {
    if (!prop) return null;
    const key = prop.key;
    if (!key) return null;
    if (!prop.computed) {
        if (key.type === 'Identifier') return key.name;
        if (key.type === 'StringLiteral') return key.value;
        if (key.type === 'Literal' && typeof key.value === 'string') return key.value;
        if (key.type === 'NumericLiteral') return String(key.value);
    }
    return null;
}

/** Index of the property with `name` in an ObjectExpression, or -1. */
function findPropIndex(objectNode, name) {
    if (objectNode?.type !== 'ObjectExpression') return -1;
    return (objectNode.properties || []).findIndex(
        prop =>
            (prop.type === 'ObjectProperty' || prop.type === 'Property') &&
            propKeyName(prop) === name
    );
}

/** Build `name: value` (identifier key) object property. */
function makeProp(j, name, valueNode) {
    return j.objectProperty(j.identifier(name), valueNode);
}

/**
 * Detect the dominant string quote style of the original source, so that
 * newly created string literals match the file instead of recast's
 * double-quote default. Returns 'single' or 'double'.
 */
function detectQuoteStyle(root, j) {
    let single = 0;
    let double = 0;
    root.find(j.StringLiteral).forEach(path => {
        const raw = (typeof path.node.extra?.raw === 'string' && path.node.extra.raw) || path.node.raw;
        if (typeof raw === 'string' && raw.length > 0) {
            if (raw.startsWith("'")) single += 1;
            else if (raw.startsWith('"')) double += 1;
        }
    });
    return double > single ? 'double' : 'single';
}

/**
 * The outermost statement-ish node containing `path` — used as the anchor
 * for migration-marker comments so they print above the whole statement
 * instead of mid-expression.
 */
function statementAnchor(path) {
    const CONTAINER_TYPES = new Set(['Program', 'BlockStatement', 'SwitchCase', 'StaticBlock']);
    let current = path;
    while (current?.parent && !CONTAINER_TYPES.has(current.parent.node.type)) {
        current = current.parent;
    }
    return current?.node ?? null;
}

/** Attach a leading migration-marker comment to a node. */
function addTodoComment(j, node, message) {
    if (!node) return;
    const comment = j.commentLine(` ${TODO_TAG}: ${message}`);
    comment.leading = true;
    if (!node.comments) node.comments = [];
    node.comments.push(comment);
}

/** True when the node is the literal `true`/`false`. */
function booleanLiteralValue(node) {
    if (node?.type === 'BooleanLiteral') return node.value;
    if (node?.type === 'Literal' && typeof node.value === 'boolean') return node.value;
    return undefined;
}

/**
 * Print per-file notes through the runner (`api.report`) when available,
 * falling back to console output for direct/programmatic invocation.
 * The jscodeshift runner already prefixes each report with the file path.
 */
function report(api, file, notes) {
    if (!notes || notes.length === 0) return;
    for (const note of notes) {
        if (typeof api?.report === 'function') {
            api.report(note);
        } else {
            const location = file.path ? `${file.path}: ` : '';
            console.log(`REP ${location}${note}`); // eslint-disable-line no-console
        }
    }
}

module.exports = {
    TODO_TAG,
    unwrap,
    unwrapPath,
    propKeyName,
    findPropIndex,
    makeProp,
    detectQuoteStyle,
    statementAnchor,
    addTodoComment,
    booleanLiteralValue,
    report,
};
