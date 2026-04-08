export interface CdnComponentsOptions {
    /** Absolute path to the directory containing component subdirectories. */
    componentsDir: string;
    /** Output directory for built CDN components. Defaults to `dist/cdn-components`. */
    outDir?: string;
    /** ES target for the final minification pass. Defaults to `'es2020'`. */
    target?: string;
}
