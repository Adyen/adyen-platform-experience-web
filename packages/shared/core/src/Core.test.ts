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

    it('should update every registered component', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.stubGlobal('window', {});

        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        const components = ['first', 'second'].map(_id => ({
            _id,
            core,
            unmount: vi.fn(),
            update: vi.fn(),
        }));

        components.forEach(component => {
            core.registerComponent(component);
        });

        await core.update({ locale: 'de-DE' });

        components.forEach(component => {
            expect(component.update).toHaveBeenCalledOnce();
            expect(component.update).toHaveBeenCalledWith(expect.objectContaining({ locale: 'de-DE' }));
        });
    });

    it('keeps a domain callback stable until translation state changes', async () => {
        vi.stubGlobal('window', {});
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        await core.initialize();
        const initial = core.getDomainTranslationInputs('reports').getCustomTranslations;
        await core.update({});

        expect(core.getDomainTranslationInputs('reports').getCustomTranslations).toBe(initial);

        await core.update({
            translations: {
                'en-US': {
                    'reports.overview.title': 'Custom reports',
                },
            },
        });

        expect(core.getDomainTranslationInputs('reports').getCustomTranslations).not.toBe(initial);
    });

    it('creates scoped domain translation connections', () => {
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            translations: {
                'en-US': {
                    'reports.overview.title': 'Custom reports',
                },
            },
        });
        const controller = new AbortController();
        const connection = core.connectDomainTranslations('reports', controller.signal);

        expect(connection.translations.getInputs().locale).toBe('en-US');
        expect(connection.translations.getInputs().getCustomTranslations?.('reports.overview.title', 'en-US')).toEqual({
            defaultTranslation: 'Custom reports',
            localeTranslation: 'Custom reports',
        });
        expect(() => connection.dispose()).not.toThrow();
    });
});
