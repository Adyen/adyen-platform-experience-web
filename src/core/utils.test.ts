/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getComponentFromCdn } from './utils';
import * as httpModule from './Http/http';

vi.mock('../components/cdn/registry', () => ({
    loadCdnComponent: vi.fn(),
}));

describe('getComponentFromCdn', () => {
    const mockUrl = 'https://cdn.example.com';

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('fetches component from CDN when VITE_LOCAL_ASSETS is not set', async () => {
        const originalEnv = process.env.VITE_LOCAL_ASSETS;
        delete process.env.VITE_LOCAL_ASSETS;

        const mockBlob = new Blob(['export default () => null;'], { type: 'text/javascript' });
        vi.spyOn(httpModule, 'httpGet').mockResolvedValue({ blob: mockBlob } as any);

        const getComponent = getComponentFromCdn({ url: mockUrl });
        const result = await getComponent({ name: 'TestComponent' } as any);

        expect(httpModule.httpGet).toHaveBeenCalledWith({
            loadingContext: `${mockUrl}`,
            path: 'TestComponent.es.js',
            versionless: true,
            skipContentType: true,
            errorLevel: 'error',
        });

        expect(result).toBeDefined();

        if (originalEnv !== undefined) {
            process.env.VITE_LOCAL_ASSETS = originalEnv;
        }
    });

    test('falls back to local bundle when CDN fetch fails', async () => {
        const originalEnv = process.env.VITE_LOCAL_ASSETS;
        delete process.env.VITE_LOCAL_ASSETS;

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(httpModule, 'httpGet').mockRejectedValue(new Error('CDN unavailable'));

        const mockComponent = () => null;
        const { loadCdnComponent } = await import('../components/cdn/registry');
        vi.mocked(loadCdnComponent).mockResolvedValue({ default: mockComponent });

        const getComponent = getComponentFromCdn({ url: mockUrl });
        const result = await getComponent({ name: 'TestComponent' } as any);

        expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
        expect(result).toBe(mockComponent);

        if (originalEnv !== undefined) {
            process.env.VITE_LOCAL_ASSETS = originalEnv;
        }
    });

    test('loads from local bundle when VITE_LOCAL_ASSETS is set', async () => {
        const originalEnv = process.env.VITE_LOCAL_ASSETS;
        process.env.VITE_LOCAL_ASSETS = 'true';

        const httpGetSpy = vi.spyOn(httpModule, 'httpGet');

        const mockComponent = () => null;
        const { loadCdnComponent } = await import('../components/cdn/registry');
        vi.mocked(loadCdnComponent).mockResolvedValue({ default: mockComponent });

        const getComponent = getComponentFromCdn({ url: mockUrl });
        const result = await getComponent({ name: 'TestComponent' } as any);

        expect(httpGetSpy).not.toHaveBeenCalled();
        expect(result).toBe(mockComponent);

        if (originalEnv !== undefined) {
            process.env.VITE_LOCAL_ASSETS = originalEnv;
        } else {
            delete process.env.VITE_LOCAL_ASSETS;
        }
    });

    test('returns null when both CDN and local bundle fail', async () => {
        const originalEnv = process.env.VITE_LOCAL_ASSETS;
        delete process.env.VITE_LOCAL_ASSETS;

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(httpModule, 'httpGet').mockRejectedValue(new Error('CDN unavailable'));

        const { loadCdnComponent } = await import('../components/cdn/registry');
        vi.mocked(loadCdnComponent).mockRejectedValue(new Error('Component not found'));

        const getComponent = getComponentFromCdn({ url: mockUrl });
        const result = await getComponent({ name: 'NonExistentComponent' } as any);

        expect(result).toBeNull();
        expect(consoleWarnSpy).toHaveBeenCalledTimes(2);

        if (originalEnv !== undefined) {
            process.env.VITE_LOCAL_ASSETS = originalEnv;
        }
    });

    test('handles blob import correctly', async () => {
        const originalEnv = process.env.VITE_LOCAL_ASSETS;
        delete process.env.VITE_LOCAL_ASSETS;

        const mockBlob = new Blob(['export default () => "test";'], { type: 'text/javascript' });
        vi.spyOn(httpModule, 'httpGet').mockResolvedValue({ blob: mockBlob } as any);

        const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');
        const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

        const getComponent = getComponentFromCdn({ url: mockUrl });
        await getComponent({ name: 'TestComponent' } as any);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(revokeObjectURLSpy).toHaveBeenCalled();

        if (originalEnv !== undefined) {
            process.env.VITE_LOCAL_ASSETS = originalEnv;
        }
    });
});
