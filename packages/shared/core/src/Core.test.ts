/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Core from './Core';
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

    it('owns the SDK localization instance', async () => {
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        await core.initialize();

        expect(core.i18n.get('transactions.common.errors.updateFilters')).toBe('Try a different search or reset your filters, and we’ll try again.');
        expect(core.bentoLocalization.getTemplate('bento.alert.close')).toBe('Close');
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

    it('applies its theme to a component root without changing the document theme', () => {
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
        });
        const root = document.createElement('div');

        core.registerThemeRoot(root);

        expect(root.getAttribute('data-adyen-pe-theme')).toBe('dark');
        expect(document.documentElement.hasAttribute('data-adyen-pe-theme')).toBe(false);
    });

    it('keeps custom themes isolated between Core instances', () => {
        const firstCore = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'light',
            customTheme: { light: { primary: '#0050b3' } },
        });
        const secondCore = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
            customTheme: { dark: { primary: '#84adff' } },
        });
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        document.body.append(firstRoot, secondRoot);

        firstCore.registerThemeRoot(firstRoot);
        secondCore.registerThemeRoot(secondRoot);

        expect(getComputedStyle(firstRoot).getPropertyValue('--adyen-sdk-color-primary')).toBe('#0050b3');
        expect(firstRoot.hasAttribute('data-adyen-pe-theme')).toBe(false);
        expect(getComputedStyle(secondRoot).getPropertyValue('--adyen-sdk-color-primary')).toBe('#84adff');
        expect(secondRoot.getAttribute('data-adyen-pe-theme')).toBe('dark');
    });

    it('rejects a theme root already owned by another Core instance', () => {
        const firstCore = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            customTheme: { light: { primary: '#0050b3' } },
        });
        const secondCore = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
            customTheme: { dark: { primary: '#84adff' } },
        });
        const root = document.createElement('div');
        document.body.append(root);

        firstCore.registerThemeRoot(root);

        expect(() => secondCore.registerThemeRoot(root)).toThrow('already themed by another Core instance');
        secondCore.unregisterThemeRoot(root);
        expect(getComputedStyle(root).getPropertyValue('--adyen-sdk-color-primary')).toBe('#0050b3');
        expect(root.hasAttribute('data-adyen-pe-theme')).toBe(false);
    });

    it('updates the theme on every root registered to the Core instance', async () => {
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
        });
        const firstRoot = document.createElement('div');
        const secondRoot = document.createElement('div');
        document.body.append(firstRoot, secondRoot);
        core.registerThemeRoot(firstRoot);
        core.registerThemeRoot(secondRoot);

        await core.update({
            themeMode: 'light',
            customTheme: { light: { background: '#f0f0f0' } },
        });

        expect(firstRoot.hasAttribute('data-adyen-pe-theme')).toBe(false);
        expect(secondRoot.hasAttribute('data-adyen-pe-theme')).toBe(false);
        expect(getComputedStyle(firstRoot).getPropertyValue('--adyen-sdk-color-background-primary')).toBe('#f0f0f0');
        expect(getComputedStyle(secondRoot).getPropertyValue('--adyen-sdk-color-background-primary')).toBe('#f0f0f0');
    });

    it('only skips component updates for non-empty theme-only patches', async () => {
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });
        const component = {
            _id: 'component',
            core,
            update: vi.fn(),
            unmount: vi.fn(),
        };
        core.registerComponent(component);

        await core.update();
        expect(component.update).toHaveBeenCalledOnce();

        component.update.mockClear();
        await core.update({ themeMode: 'dark' });
        expect(component.update).not.toHaveBeenCalled();
    });

    it('preserves the current theme and options when theme generation fails', async () => {
        const customTheme = { dark: { primary: '#84adff' } };
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
            customTheme,
        });
        const root = document.createElement('div');
        document.body.append(root);
        core.registerThemeRoot(root);

        await expect(core.update({ themeMode: 'light', customTheme: { light: { primary: 'invalid' } } })).rejects.toThrow();

        expect(core.options.themeMode).toBe('dark');
        expect(core.options.customTheme).toBe(customTheme);
        expect(root.getAttribute('data-adyen-pe-theme')).toBe('dark');
        expect(getComputedStyle(root).getPropertyValue('--adyen-sdk-color-primary')).toBe('#84adff');
    });

    it('rejects invalid custom theme colors during construction', () => {
        expect(
            () =>
                new Core({
                    locale: 'en-US',
                    onSessionCreate: vi.fn(),
                    customTheme: { light: { primary: 'invalid' } },
                })
        ).toThrow('Invalid hex color');
    });
});
