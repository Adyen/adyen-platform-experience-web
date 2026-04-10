/**
 * Virtual module ID for tree-shaken icons.
 */
export const VIRTUAL_ICONS_ID = 'virtual:tree-shaken-icons';

/**
 * Resolved virtual module ID (prefixed with null byte for Rollup).
 */
export const RESOLVED_VIRTUAL_ICONS_ID = '\0' + VIRTUAL_ICONS_ID;

/**
 * Default plugin name for the tree-shake icons plugin.
 */
export const SHAKE_ICONS_PLUGIN = 'shake-icons';
