/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Core } from './Core';
import { applyTheme } from './theme/ThemeManager';

vi.mock('./theme/ThemeManager', () => ({
    applyTheme: vi.fn(),
}));

const createCore = () =>
    new Core({
        locale: 'en-US',
        onSessionCreate: vi.fn(),
        themeMode: 'dark',
        customThemes: {
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        },
    });

describe('Vue Core theme lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('applies the initial theme once', () => {
        createCore();

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith('dark', {
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        });
    });

    it('applies the light default when the initial theme is omitted', () => {
        new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith(undefined, undefined);
    });

    it('preserves the current theme when an update omits theme options', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ locale: 'de-DE' });

        expect(applyTheme).not.toHaveBeenCalled();
        expect(core.options.themeMode).toBe('dark');
        expect(core.options.customThemes).toEqual({
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        });
    });

    it('changes theme mode without replacing custom themes', async () => {
        const customThemes = {
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        };
        const core = new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
            themeMode: 'dark',
            customThemes,
        });
        const component = {
            _id: 'component',
            core,
            update: vi.fn(),
            unmount: vi.fn(),
        };
        core.registerComponent(component);
        vi.mocked(applyTheme).mockClear();

        await core.update({ themeMode: 'light' });

        expect(applyTheme).toHaveBeenCalledWith('light', customThemes);
        expect(component.update).not.toHaveBeenCalled();
        expect(core.options.themeMode).toBe('light');
        expect(core.options.customThemes).toBe(customThemes);
    });

    it('skips unchanged theme updates', async () => {
        const core = createCore();
        const component = {
            _id: 'component',
            core,
            update: vi.fn(),
            unmount: vi.fn(),
        };
        core.registerComponent(component);
        vi.mocked(applyTheme).mockClear();

        await core.update({
            themeMode: core.options.themeMode,
            customThemes: core.options.customThemes,
        });

        expect(applyTheme).not.toHaveBeenCalled();
        expect(component.update).not.toHaveBeenCalled();
    });

    it('changes custom themes without changing theme mode', async () => {
        const core = createCore();
        const customThemes = {
            dark: { background: '#111111' },
        };
        vi.mocked(applyTheme).mockClear();

        await core.update({ customThemes });

        expect(applyTheme).toHaveBeenCalledWith('dark', customThemes);
        expect(core.options.themeMode).toBe('dark');
        expect(core.options.customThemes).toBe(customThemes);
    });

    it('clears custom themes without changing theme mode', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ customThemes: undefined });

        expect(applyTheme).toHaveBeenCalledWith('dark', undefined);
        expect(core.options.themeMode).toBe('dark');
        expect(core.options.customThemes).toBeUndefined();
    });

    it('resets to light without replacing custom themes when theme mode is cleared', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ themeMode: undefined });

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith(undefined, {
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        });
        expect(core.options.themeMode).toBeUndefined();
        expect(core.options.customThemes).toEqual({
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        });
    });

    it('does not update Core state or components when theme application fails', async () => {
        const core = createCore();
        const component = {
            _id: 'component',
            core,
            update: vi.fn(),
            unmount: vi.fn(),
        };
        core.registerComponent(component);
        vi.mocked(applyTheme).mockImplementationOnce(() => {
            throw new Error('Invalid theme');
        });

        await expect(core.update({ customThemes: { dark: { primary: 'invalid' } } })).rejects.toThrow('Invalid theme');
        expect(core.options.themeMode).toBe('dark');
        expect(core.options.customThemes).toEqual({
            light: { primary: '#84adff' },
            dark: { primary: '#0066ff' },
        });
        expect(component.update).not.toHaveBeenCalled();
    });
});
