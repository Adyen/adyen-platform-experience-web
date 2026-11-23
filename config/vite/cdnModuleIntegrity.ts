import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isCSSRequest, normalizePath, type Plugin, type Rollup } from 'vite';
import { INTEGRITY_MANIFEST_PLACEHOLDER } from './cdnModuleIntegrityRuntime';

export const CDN_MODULE_INTEGRITY_RUNTIME = normalizePath(fileURLToPath(new URL('./cdnModuleIntegrityRuntime.ts', import.meta.url)));

const IMPORTER_NAME = '__adyenPeImportWithIntegrity';
const CALL_SITE_MARKER = '__ADYEN_PE_DYNAMIC_IMPORT__';
const CALL_SITE_PATTERN = new RegExp(String.raw`(["'\x60])${CALL_SITE_MARKER}:(\d+)\1`, 'g');
const MANIFEST_PATTERN = new RegExp(String.raw`(["'\x60])${INTEGRITY_MANIFEST_PLACEHOLDER}\1`, 'g');
const DYNAMIC_IMPORT_PATTERN = /\bimport\s*\(/;

// sha256 keeps the manifest embedded in the entry ~25% smaller than sha384; integrators still pin the entry with sha384.
const toIntegrity = (source: Uint8Array) => createHash('sha256').update(source).digest('base64');

type SpecifierNode = { type: string; value?: unknown; expressions?: unknown[]; quasis?: { value: { cooked?: string | null } }[] };
type ImportExpressionNode = { type: 'ImportExpression'; start: number; end: number; source: SpecifierNode };

const collectImportExpressions = (node: unknown, found: ImportExpressionNode[] = []): ImportExpressionNode[] => {
    if (Array.isArray(node)) node.forEach(child => collectImportExpressions(child, found));
    else if (node && typeof node === 'object') {
        if ((node as { type?: unknown }).type === 'ImportExpression') found.push(node as ImportExpressionNode);
        Object.values(node).forEach(child => collectImportExpressions(child, found));
    }
    return found;
};

const getStaticSpecifier = ({ type, value, expressions, quasis }: SpecifierNode) => {
    if (type === 'Literal' && typeof value === 'string') return value;
    if (type === 'TemplateLiteral' && expressions?.length === 0) return quasis?.[0]?.value.cooked ?? undefined;
};

/**
 * Covers every lazily loaded chunk of the CDN bundle with Subresource Integrity without an import map. Integrators pin
 * the entry (which must not statically import other chunks), and the entry embeds the SRI hash of every chunk:
 * 1. `transform` rewrites each `import(x)` to `importWithIntegrity(() => import(x), marker)` (see the runtime).
 * 2. `generateBundle` replaces each marker with the chunks the browser must still fetch for that import (the target and
 *    its static dependencies not already loaded by the importing chunk), in dependency order.
 * 3. `writeBundle` hashes those chunks as written to disk and embeds the hashes in the entry. Chunks only reference
 *    other chunks by path, so their content (and hash) never depends on another chunk's hash.
 */
export const cdnModuleIntegrity = ({ entryFileName }: { entryFileName: string }): Plugin => {
    let targets: ({ moduleId: string } | { error: string })[] = [];
    let preloadedFiles = new Set<string>();

    return {
        name: 'cdn-module-integrity',
        apply: 'build',
        enforce: 'post',
        buildStart() {
            targets = [];
            preloadedFiles = new Set();
        },
        async transform(code, id) {
            if (normalizePath(id) === CDN_MODULE_INTEGRITY_RUNTIME || !DYNAMIC_IMPORT_PATTERN.test(code)) return null;

            const importExpressions = collectImportExpressions(this.parse(code)).sort((a, b) => b.start - a.start);
            if (!importExpressions.length) return null;

            let transformed = code;
            for (const { start, end, source } of importExpressions) {
                const specifier = getStaticSpecifier(source);
                const resolved = specifier === undefined ? null : await this.resolve(specifier, id);
                // Unresolvable imports only fail the build if they survive tree-shaking (e.g. not in dev-only branches).
                const target =
                    resolved && !resolved.external
                        ? { moduleId: resolved.id }
                        : {
                              error: `${id} dynamically imports ${specifier === undefined ? 'a non-static specifier' : `"${specifier}"`}, which is not a bundled chunk`,
                          };

                const marker = JSON.stringify(`${CALL_SITE_MARKER}:${targets.push(target) - 1}`);
                transformed = `${transformed.slice(0, start)}${IMPORTER_NAME}(() => ${code.slice(start, end)}, ${marker})${transformed.slice(end)}`;
            }

            return {
                code: `import { importWithIntegrity as ${IMPORTER_NAME} } from ${JSON.stringify(CDN_MODULE_INTEGRITY_RUNTIME)};\n${transformed}`,
                map: null,
            };
        },
        generateBundle(_, bundle) {
            const entry = bundle[entryFileName];
            if (entry?.type !== 'chunk') return this.error(`cdn-module-integrity could not find the entry "${entryFileName}" in the bundle`);
            if (entry.imports.length) {
                this.error(`The entry must not statically import other chunks, which would load without integrity: ${entry.imports.join(', ')}`);
            }
            if (!entry.moduleIds.some(moduleId => normalizePath(moduleId) === CDN_MODULE_INTEGRITY_RUNTIME)) {
                this.error('The integrity runtime must be bundled into the entry, which embeds the integrity manifest');
            }

            const chunks = new Map(
                Object.values(bundle)
                    .filter((output): output is Rollup.OutputChunk => output.type === 'chunk')
                    .map(chunk => [chunk.fileName, chunk])
            );
            const chunkByModuleId = new Map(
                [...chunks.values()].flatMap(chunk => chunk.moduleIds.map(moduleId => [moduleId, chunk.fileName] as const))
            );

            const collectStaticGraph = (fileName: string, visited: Set<string>, order: string[] = []) => {
                if (visited.has(fileName)) return order;
                visited.add(fileName);
                chunks.get(fileName)?.imports.forEach(dependency => collectStaticGraph(dependency, visited, order));
                order.push(fileName);
                return order;
            };

            for (const chunk of chunks.values()) {
                const loaded = new Set(collectStaticGraph(chunk.fileName, new Set([entryFileName])));
                loaded.add(entryFileName);
                const covered = new Set<string>();

                chunk.code = chunk.code.replace(CALL_SITE_PATTERN, (_match, _quote, index: string) => {
                    const callSite = targets[Number(index)];
                    if (!callSite) return this.error(`Unknown dynamic import marker ${index} in ${chunk.fileName}`);
                    if ('error' in callSite) return this.error(`Cannot cover a dynamic import with Subresource Integrity: ${callSite.error}`);

                    const target = chunkByModuleId.get(callSite.moduleId);
                    // Vite drops pure CSS chunks and replaces their dynamic imports with `Promise.resolve({})`.
                    if (!target && isCSSRequest(callSite.moduleId)) return '[]';
                    if (!target) return this.error(`Could not find the chunk of the dynamically imported module "${callSite.moduleId}"`);

                    covered.add(target);
                    const files = collectStaticGraph(target, new Set(loaded));
                    files.forEach(file => preloadedFiles.add(file));
                    return JSON.stringify(files);
                });

                const uncovered = chunk.dynamicImports.filter(fileName => chunks.has(fileName) && !covered.has(fileName));
                if (uncovered.length) this.error(`${chunk.fileName} dynamically imports chunks without integrity: ${uncovered.join(', ')}`);
            }
        },
        async writeBundle({ dir }) {
            if (!dir) return this.error('cdn-module-integrity requires an output directory');

            const manifest = Object.fromEntries(
                await Promise.all([...preloadedFiles].sort().map(async fileName => [fileName, toIntegrity(await readFile(resolve(dir, fileName)))]))
            );

            const entryPath = resolve(dir, entryFileName);
            const entrySource = await readFile(entryPath, 'utf8');
            let replacements = 0;
            const patchedSource = entrySource.replace(MANIFEST_PATTERN, () => {
                replacements++;
                return JSON.stringify(JSON.stringify(manifest));
            });
            if (replacements !== 1) this.error(`Expected one integrity manifest placeholder in the entry, found ${replacements}`);

            await writeFile(entryPath, patchedSource);
        },
    };
};
