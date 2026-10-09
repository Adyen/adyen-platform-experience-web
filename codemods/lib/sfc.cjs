'use strict';

/**
 * Vue Single-File Component (.vue) support for the V1 → V2 codemods.
 *
 * jscodeshift parsers only handle JS/TS, so a `.vue` file as a whole cannot
 * be parsed. This wrapper extracts the `<script>` / `<script setup>` blocks
 * with @vue/compiler-sfc (the official SFC parser), runs the wrapped
 * transform on each block's source as if it were a standalone file, and
 * splices any changed block back into the SFC at its original offsets.
 * Everything outside the script blocks (templates, styles, comments) stays
 * byte-for-byte identical, and migration-marker comments land inside the script block.
 *
 * `SFCBlock.loc` spans exactly the inner script content (the offsets exclude
 * the `<script ...>` / `</script>` tags), so splicing is lossless.
 *
 * @vue/compiler-sfc is an optional dependency: it is only required (lazily,
 * on the first .vue file) when .vue files are actually being processed.
 */
let vueCompilerSfc = null;

function getVueCompilerSfc() {
    if (!vueCompilerSfc) {
        vueCompilerSfc = require('@vue/compiler-sfc');
    }
    return vueCompilerSfc;
}

/** Wrap a plain (file, api, options) transform with .vue SFC support. */
function withSfcSupport(coreTransform) {
    return function sfcAwareTransform(file, api, options) {
        if (!file.path?.endsWith('.vue')) {
            return coreTransform(file, api, options);
        }

        let parse;
        try {
            ({ parse } = getVueCompilerSfc());
        } catch {
            throw new Error(
                'Migrating .vue Single-File Components requires @vue/compiler-sfc. ' +
                    'Install it as a dev dependency (npm install --save-dev @vue/compiler-sfc) ' +
                    'or exclude .vue files with --extensions=ts,tsx,js,jsx,mjs,cjs.'
            );
        }

        let descriptor;
        try {
            ({ descriptor } = parse(file.source, { filename: file.path }));
        } catch {
            return undefined;
        }
        if (!descriptor) return undefined;

        let source = file.source;
        let mutated = false;

        // A SFC has at most one plain `<script>` plus one `<script setup>`.
        // Process them from the end of the file to the beginning, so splicing
        // a changed block never shifts the offsets of the blocks after it.
        const blocks = [descriptor.script, descriptor.scriptSetup]
            .filter(block => typeof block?.content === 'string')
            .sort((a, b) => b.loc.start.offset - a.loc.start.offset);

        for (const block of blocks) {
            const start = block.loc.start.offset;
            const end = block.loc.end.offset;
            if (source.slice(start, end) !== block.content) continue; // safety: offsets must match

            const out = coreTransform({ ...file, source: block.content }, api, options);
            if (typeof out === 'string' && out !== block.content) {
                source = source.slice(0, start) + out + source.slice(end);
                mutated = true;
            }
        }

        return mutated ? source : undefined;
    };
}

module.exports = { withSfcSupport };
