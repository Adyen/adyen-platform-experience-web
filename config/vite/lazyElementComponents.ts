import type { Plugin } from 'vite';

export const LAZY_ELEMENT_COMPONENT_PREFIX = '\0lazy-element-component:';

export const ELEMENT_FILE_PATTERN = /\/packages\/domains\/[^/]+\/vue\/src\/(?:.+\/)?[A-Z]\w*Element\.ts$/;

const isVueFile = (source: string) => source.split('?', 1)[0]!.endsWith('.vue');

export const lazyElementComponents = (elementFilePattern: RegExp = ELEMENT_FILE_PATTERN): Plugin => ({
    name: 'lazy-element-components',
    enforce: 'pre',
    async resolveId(source, importer, options) {
        if (!importer || !isVueFile(source) || !elementFilePattern.test(importer.replaceAll('\\', '/'))) return null;

        const resolved = await this.resolve(source, importer, { ...options, skipSelf: true });
        return resolved && !resolved.external ? `${LAZY_ELEMENT_COMPONENT_PREFIX}${resolved.id}` : null;
    },
    load(id) {
        if (!id.startsWith(LAZY_ELEMENT_COMPONENT_PREFIX)) return null;

        const componentId = JSON.stringify(id.slice(LAZY_ELEMENT_COMPONENT_PREFIX.length));
        return `import { defineAsyncComponent } from 'vue';\nexport default defineAsyncComponent(() => import(${componentId}));\n`;
    },
});
