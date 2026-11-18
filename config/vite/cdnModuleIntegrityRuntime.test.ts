/**
 * @vitest-environment node
 */
import { describe, expect, test, vi } from 'vitest';
import { createModuleIntegrityImporter } from './cdnModuleIntegrityRuntime';

const BASE_URL = 'https://cdn.example.com/platform-components/v2.0.0/adyen-platform-experience-web.js';
const INTEGRITY = { 'chunks/a.js': 'hash-a', 'chunks/b.js': 'hash-b' };

type FakeLink = Pick<HTMLLinkElement, 'rel' | 'crossOrigin' | 'integrity' | 'href'> & {
    listeners: Partial<Record<'load' | 'error', () => void>>;
    remove: () => void;
};

const createDocument = ({ supportsModulePreload = true } = {}) => {
    const links: FakeLink[] = [];
    const doc = {
        head: { appendChild: (link: FakeLink) => links.push(link) },
        createElement: () => {
            const listeners: FakeLink['listeners'] = {};
            return {
                listeners,
                relList: { supports: (token: string) => supportsModulePreload && token === 'modulepreload' },
                addEventListener: (type: 'load' | 'error', listener: () => void) => (listeners[type] = listener),
                remove: vi.fn(),
            };
        },
    };
    return { doc: doc as unknown as Document, links };
};

const flush = () => new Promise(resolve => setTimeout(resolve));

describe('createModuleIntegrityImporter', () => {
    test('preloads every file with its integrity in the given order before importing', async () => {
        const { doc, links } = createDocument();
        const load = vi.fn().mockResolvedValue({ default: 'module' });
        const result = createModuleIntegrityImporter(INTEGRITY, BASE_URL, doc)(load, ['chunks/b.js', 'chunks/a.js']);

        expect(links).toEqual([
            expect.objectContaining({
                rel: 'modulepreload',
                crossOrigin: 'anonymous',
                integrity: 'sha256-hash-b',
                href: 'https://cdn.example.com/platform-components/v2.0.0/chunks/b.js',
            }),
            expect.objectContaining({ integrity: 'sha256-hash-a', href: 'https://cdn.example.com/platform-components/v2.0.0/chunks/a.js' }),
        ]);

        links[0]?.listeners.load?.();
        await flush();
        expect(load).not.toHaveBeenCalled();

        links[1]?.listeners.load?.();
        await expect(result).resolves.toEqual({ default: 'module' });
        expect(load).toHaveBeenCalledOnce();
    });

    test('never imports the module when a preload fails, and preloads it again on retry', async () => {
        const { doc, links } = createDocument();
        const load = vi.fn().mockResolvedValue({});
        const importWithIntegrity = createModuleIntegrityImporter(INTEGRITY, BASE_URL, doc);
        const result = importWithIntegrity(load, ['chunks/a.js']);

        links[0]?.listeners.error?.();
        await expect(result).rejects.toThrow('Failed to load https://cdn.example.com/platform-components/v2.0.0/chunks/a.js');
        expect(load).not.toHaveBeenCalled();
        expect(links[0]?.remove).toHaveBeenCalledOnce();

        const retry = importWithIntegrity(load, ['chunks/a.js']);
        expect(links).toHaveLength(2);
        links[1]?.listeners.load?.();
        await expect(retry).resolves.toEqual({});
    });

    test('shares preloads between imports', async () => {
        const { doc, links } = createDocument();
        const importWithIntegrity = createModuleIntegrityImporter(INTEGRITY, BASE_URL, doc);
        const first = importWithIntegrity(() => Promise.resolve('first'), ['chunks/a.js']);
        const second = importWithIntegrity(() => Promise.resolve('second'), ['chunks/a.js', 'chunks/b.js']);

        expect(links.map(link => link.integrity)).toEqual(['sha256-hash-a', 'sha256-hash-b']);
        links.forEach(link => link.listeners.load?.());
        await expect(Promise.all([first, second])).resolves.toEqual(['first', 'second']);
    });

    test('refuses to import a file missing from the integrity manifest', async () => {
        const { doc, links } = createDocument();
        const load = vi.fn();

        await expect(createModuleIntegrityImporter(INTEGRITY, BASE_URL, doc)(load, ['chunks/unknown.js'])).rejects.toThrow('Missing integrity hash');
        expect(links).toHaveLength(0);
        expect(load).not.toHaveBeenCalled();
    });

    test('imports directly in browsers without modulepreload support', async () => {
        const { doc, links } = createDocument({ supportsModulePreload: false });

        await expect(createModuleIntegrityImporter(INTEGRITY, BASE_URL, doc)(() => Promise.resolve('module'), ['chunks/a.js'])).resolves.toBe(
            'module'
        );
        expect(links).toHaveLength(0);
    });
});
