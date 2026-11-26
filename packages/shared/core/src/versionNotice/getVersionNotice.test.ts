import { describe, expect, test, vi } from 'vitest';
import { NPM_PACKAGE_NAME, NPM_REGISTRY_URL } from './constants';
import { getVersionNotice } from './getVersionNotice';

type RegistryStub = Record<string, { version: string; deprecated?: string } | number>;

const manifestUrl = (specifier: string) => `${NPM_REGISTRY_URL}/${NPM_PACKAGE_NAME}/${specifier}`;

/** Serves registry manifests by dist-tag or version; a number answers with that HTTP status, anything unlisted with 404. */
const createRegistry = (stub: RegistryStub) =>
    vi.fn<typeof fetch>(async input => {
        const entry = Object.entries(stub).find(([specifier]) => manifestUrl(specifier) === String(input))?.[1];
        if (entry === undefined) return new Response(null, { status: 404 });
        if (typeof entry === 'number') return new Response(null, { status: entry });
        return Response.json(entry);
    });

describe('getVersionNotice', () => {
    describe('Deprecation', () => {
        test('should report a stable version that is deprecated on npm', async () => {
            const registry = createRegistry({ '1.12.0': { version: '1.12.0', deprecated: 'Upgrade to 1.14' } });

            await expect(getVersionNotice('1.12.0', registry)).resolves.toEqual({ kind: 'deprecated', currentVersion: '1.12.0' });
        });

        test('should not report a stable version that is not deprecated', async () => {
            const registry = createRegistry({ '1.14.3': { version: '1.14.3' } });

            await expect(getVersionNotice('1.14.3', registry)).resolves.toBeNull();
        });

        test('should not report a version whose deprecation was lifted', async () => {
            const registry = createRegistry({ '1.14.3': { version: '1.14.3', deprecated: '' } });

            await expect(getVersionNotice('1.14.3', registry)).resolves.toBeNull();
        });

        test('should report a deprecated prerelease as deprecated even when a newer prerelease exists', async () => {
            const registry = createRegistry({
                '2.0.0-beta.1': { version: '2.0.0-beta.1', deprecated: 'Broken build' },
                beta: { version: '2.0.0-beta.3' },
            });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toEqual({ kind: 'deprecated', currentVersion: '2.0.0-beta.1' });
        });
    });

    describe('Outdated prerelease', () => {
        test('should report the newer prerelease published on the mainline channel tag', async () => {
            const registry = createRegistry({ '2.0.0-beta.1': { version: '2.0.0-beta.1' }, beta: { version: '2.0.0-beta.3' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toEqual({
                kind: 'outdated',
                currentVersion: '2.0.0-beta.1',
                latestVersion: '2.0.0-beta.3',
            });
        });

        test('should prefer the channel tag of its own major over the mainline channel tag', async () => {
            const registry = createRegistry({
                '2.1.0-rc.0': { version: '2.1.0-rc.0' },
                'v2-rc': { version: '2.1.0-rc.2' },
                rc: { version: '3.0.0-rc.0' },
            });

            await expect(getVersionNotice('2.1.0-rc.0', registry)).resolves.toEqual({
                kind: 'outdated',
                currentVersion: '2.1.0-rc.0',
                latestVersion: '2.1.0-rc.2',
            });
        });

        test('should not report a newer prerelease from another major', async () => {
            const registry = createRegistry({ '2.0.0-beta.1': { version: '2.0.0-beta.1' }, beta: { version: '3.0.0-beta.0' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toBeNull();
        });

        test('should not report a prerelease that is already the latest on its channel', async () => {
            const registry = createRegistry({ '2.0.0-beta.1': { version: '2.0.0-beta.1' }, beta: { version: '2.0.0-beta.1' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toBeNull();
        });

        test('should not look up a channel tag for a stable version', async () => {
            const registry = createRegistry({ '1.14.3': { version: '1.14.3' }, beta: { version: '2.0.0-beta.1' } });

            await getVersionNotice('1.14.3', registry);

            expect(registry).toHaveBeenCalledOnce();
            expect(registry).toHaveBeenCalledWith(manifestUrl('1.14.3'), expect.anything());
        });

        test('should not look up a channel tag for an unknown prerelease channel', async () => {
            const registry = createRegistry({ '2.0.0-canary.1': { version: '2.0.0-canary.1' } });

            await getVersionNotice('2.0.0-canary.1', registry);

            expect(registry).toHaveBeenCalledOnce();
        });
    });

    describe('Requests', () => {
        test('should not send credentials to the registry', async () => {
            const registry = createRegistry({ '1.14.3': { version: '1.14.3' } });

            await getVersionNotice('1.14.3', registry);

            expect(registry).toHaveBeenCalledWith(manifestUrl('1.14.3'), expect.objectContaining({ credentials: 'omit' }));
        });
    });

    describe('Failures', () => {
        test('should still report an outdated prerelease when its own manifest is unavailable', async () => {
            const registry = createRegistry({ beta: { version: '2.0.0-beta.3' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toMatchObject({ kind: 'outdated', latestVersion: '2.0.0-beta.3' });
        });

        test('should not fall back to the mainline channel tag when the registry fails', async () => {
            const registry = createRegistry({ '2.0.0-beta.1': { version: '2.0.0-beta.1' }, 'v2-beta': 500, beta: { version: '2.0.0-beta.3' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toBeNull();
        });

        test('should resolve to null when the network fails', async () => {
            const registry = vi.fn<typeof fetch>().mockRejectedValue(new TypeError('Failed to fetch'));

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toBeNull();
        });

        test('should resolve to null when the registry answers with an unparseable version', async () => {
            const registry = createRegistry({ '2.0.0-beta.1': { version: '2.0.0-beta.1' }, beta: { version: 'not-a-version' } });

            await expect(getVersionNotice('2.0.0-beta.1', registry)).resolves.toBeNull();
        });

        test('should resolve to null without requests for a malformed current version', async () => {
            const registry = createRegistry({});

            await expect(getVersionNotice('local', registry)).resolves.toBeNull();
            expect(registry).not.toHaveBeenCalled();
        });
    });
});
