export interface ShakeIconsOptions {
    /** Optional plugin name. Defaults to 'shake-icons'. */
    pluginName?: string;
    /** Path to the icons directory. Defaults to 'src/images/icons'. */
    iconsDir?: string;
    /**
     * Enforce static icon names only.
     * When true, dynamic icon usage will cause build to fail.
     * When false, dynamic icons are allowed but won't be tree-shaken.
     * Defaults to false.
     */
    strict?: boolean;
}
