import type { Plugin } from 'vite';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const DIST_CODEMODS_DIR = 'dist/codemods';
const TEST_FILE_PATTERN = /\.(?:test|spec)\./;

/**
 * Colocated test files (and any future spec files) never ship: only the CLI
 * itself, its transforms, its libs, and the README belong in the package.
 */
const isShippedCodemodFile = (source: string) => !TEST_FILE_PATTERN.test(source);

/**
 * Copies the standalone V1 → V2 migration CLI (run.js, transforms, lib,
 * README) into the published dist tree so the `v2-migration` bin ships with
 * the npm package. The codemods stay plain files rather than being bundled
 * into the ES/CJS library outputs: jscodeshift loads transforms with
 * require() from its own worker processes, and run.js resolves jscodeshift
 * from the consuming project at run time.
 *
 * The non-UMD build empties dist/ before writing, so the copy runs in
 * closeBundle (after the bundles land). It is idempotent: repeated builds —
 * including the UMD build, which writes into the same dist/ without emptying
 * it — refresh the copy cleanly.
 */
export const copyCodemods = (workspaceRoot: string): Plugin => ({
    name: 'copy-codemods',
    apply: 'build',
    closeBundle() {
        const codemodsRoot = join(workspaceRoot, 'codemods');
        const distCodemodsRoot = join(workspaceRoot, DIST_CODEMODS_DIR);

        if (!existsSync(join(codemodsRoot, 'run.js'))) {
            throw new Error(`Expected the codemods CLI at ${codemodsRoot} — the v2-migration bin would be broken.`);
        }

        const dirCopySyncOptions = { recursive: true, filter: isShippedCodemodFile };

        rmSync(distCodemodsRoot, { recursive: true, force: true });
        mkdirSync(distCodemodsRoot, { recursive: true });
        cpSync(join(codemodsRoot, 'run.js'), join(distCodemodsRoot, 'run.js'));
        cpSync(join(codemodsRoot, 'transforms'), join(distCodemodsRoot, 'transforms'), dirCopySyncOptions);
        cpSync(join(codemodsRoot, 'lib'), join(distCodemodsRoot, 'lib'), dirCopySyncOptions);
        cpSync(join(codemodsRoot, 'README.md'), join(distCodemodsRoot, 'README.md'));
    },
});
