import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Core, { AVAILABLE_TRANSLATIONS_DEPRECATION_WARNING } from './Core';
import { SERVER_SIDE_INITIALIZATION_WARNING } from './runtime';

describe('Core', () => {
    const originalNodeEnv = process.env.NODE_ENV;

    beforeEach(() => {
        process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
        process.env.NODE_ENV = originalNodeEnv;
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it('should warn when availableTranslations option is provided', () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            availableTranslations: [],
        });

        const warningCalls = consoleWarnSpy.mock.calls.filter(([message]) => message === AVAILABLE_TRANSLATIONS_DEPRECATION_WARNING);
        expect(warningCalls).toHaveLength(1);
    });

    it('should warn only once for availableTranslations even after multiple updates', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            availableTranslations: [],
        });

        await core.update({});
        await core.update({});

        const warningCalls = consoleWarnSpy.mock.calls.filter(([message]) => message === AVAILABLE_TRANSLATIONS_DEPRECATION_WARNING);
        expect(warningCalls).toHaveLength(1);
    });

    it('should not warn when availableTranslations option is not provided', async () => {
        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        const warningCalls = consoleWarnSpy.mock.calls.filter(([message]) => message === AVAILABLE_TRANSLATIONS_DEPRECATION_WARNING);
        expect(warningCalls).toHaveLength(0);
    });

    it('should warn once when initialized server-side in development mode', async () => {
        vi.stubGlobal('window', undefined);

        const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        await core.initialize();
        await core.initialize();

        const warningCalls = consoleWarnSpy.mock.calls.filter(([message]) => message === SERVER_SIDE_INITIALIZATION_WARNING);

        expect(warningCalls).toHaveLength(1);
    });

    it('should not apply a theme server-side', () => {
        vi.stubGlobal('window', undefined);
        vi.stubGlobal('document', undefined);

        expect(
            () =>
                new Core({
                    locale: 'en-US',
                    onSessionCreate: vi.fn(),
                    theme: { primary: '#2292bc' },
                })
        ).not.toThrow();
    });
});
