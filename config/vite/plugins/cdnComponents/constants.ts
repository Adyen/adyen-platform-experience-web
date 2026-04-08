/**
 * Base name for the CDN components plugin system.
 * Used to generate plugin names, virtual module IDs, etc.
 */
export const CDN_COMPONENTS_PLUGIN = 'cdn-components';

/**
 * Plugin name for the config plugin
 */
export const CDN_COMPONENTS_CONFIG_PLUGIN = `${CDN_COMPONENTS_PLUGIN}:config`;

/**
 * Plugin name for the inline CSS plugin
 */
export const CDN_COMPONENTS_INLINE_CSS_PLUGIN = `${CDN_COMPONENTS_PLUGIN}:inline-css`;
