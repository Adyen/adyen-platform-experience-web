/**
 * Browser runtime bundled into the CDN entry by the `cdn-module-integrity` plugin. Every dynamic import of the CDN
 * bundle is rewritten to go through `importWithIntegrity`, which first fetches the target chunk and its not-yet-loaded
 * static dependencies through `<link rel="modulepreload" integrity>`. The browser stores the verified modules in its
 * module map, so the dynamic import that follows reuses them instead of fetching them again unverified.
 */
export const INTEGRITY_MANIFEST_PLACEHOLDER = '__ADYEN_PE_CDN_INTEGRITY_MANIFEST__';

type ModuleLoader<T> = () => Promise<T>;

export type ModuleIntegrityImporter = <T>(load: ModuleLoader<T>, files: readonly string[]) => Promise<T>;

export const createModuleIntegrityImporter = (
    integrity: Readonly<Record<string, string>>,
    baseUrl: string,
    doc: Document = document
): ModuleIntegrityImporter => {
    const preloads = new Map<string, Promise<void>>();
    // Browsers without modulepreload never fire load/error for the link, so they fall back to unverified imports.
    const supportsModulePreload = !!doc.createElement('link').relList?.supports?.('modulepreload');

    const preload = (file: string) => {
        const href = new URL(file, baseUrl).href;
        const pending = preloads.get(href);
        if (pending) return pending;

        const hash = integrity[file];
        if (!hash) return Promise.reject(new Error(`Missing integrity hash for ${href}`));

        const promise = new Promise<void>((resolve, reject) => {
            const link = doc.createElement('link');
            link.rel = 'modulepreload';
            link.crossOrigin = 'anonymous';
            link.integrity = `sha256-${hash}`;
            link.href = href;
            link.addEventListener('load', () => resolve(), { once: true });
            link.addEventListener(
                'error',
                () => {
                    preloads.delete(href);
                    link.remove();
                    reject(new Error(`Failed to load ${href} with a matching integrity hash`));
                },
                { once: true }
            );
            (doc.head ?? doc.documentElement).appendChild(link);
        });

        preloads.set(href, promise);
        return promise;
    };

    // Links are appended synchronously in the given order (dependencies first), so a dependency is never requested
    // without its integrity hash by the browser resolving the static imports of a module preloaded before it.
    return (load, files) => (supportsModulePreload ? Promise.all(files.map(preload)).then(load) : load());
};

let defaultImporter: ModuleIntegrityImporter | undefined;

export const importWithIntegrity: ModuleIntegrityImporter = (load, files) => {
    defaultImporter ??= createModuleIntegrityImporter(JSON.parse(INTEGRITY_MANIFEST_PLACEHOLDER), import.meta.url);
    return defaultImporter(load, files);
};
