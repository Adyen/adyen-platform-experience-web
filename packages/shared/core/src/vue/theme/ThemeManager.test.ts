/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeGenerator, ThemeProps } from '@adyen/adyen-shared-web';
import { ThemeManager, applyTheme, THEME_MODE_ATTRIBUTE } from './ThemeManager';

type ThemeStyleGenerator = Pick<ThemeGenerator, 'create' | 'destroy'>;

const createGenerator = (): ThemeStyleGenerator => ({
    create: vi.fn(),
    destroy: vi.fn(),
});

describe('ThemeManager', () => {
    let generator: ThemeStyleGenerator;
    let manager: ThemeManager;

    beforeEach(() => {
        document.documentElement.removeAttribute(THEME_MODE_ATTRIBUTE);
        generator = createGenerator();
        manager = new ThemeManager(generator);
    });

    it('uses the light Bento defaults when the theme is undefined', () => {
        document.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');

        manager.apply();

        expect(generator.destroy).toHaveBeenCalledOnce();
        expect(document.documentElement.hasAttribute(THEME_MODE_ATTRIBUTE)).toBe(false);
    });

    it('uses the dark Bento defaults without generating brand variables', () => {
        manager.apply('dark');

        expect(generator.destroy).toHaveBeenCalledOnce();
        expect(generator.create).not.toHaveBeenCalled();
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });

    it('generates dark brand variables after selecting the dark Bento defaults', () => {
        manager.apply('dark', { dark: { primary: '#0066ff' } });

        expect(generator.create).toHaveBeenCalledWith({
            primary: '#0066ff',
            dark: true,
        } satisfies ThemeProps);
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });

    it('replaces a dark custom theme with a complete light custom theme', () => {
        manager.apply('dark', { dark: { primary: '#0066ff' } });
        manager.apply('light', { light: { background: '#ffffff' } });

        expect(generator.create).toHaveBeenLastCalledWith({
            background: '#ffffff',
            dark: false,
        } satisfies ThemeProps);
        expect(document.documentElement.hasAttribute(THEME_MODE_ATTRIBUTE)).toBe(false);
    });

    it('uses Bento defaults when the selected mode has no overrides', () => {
        manager.apply('dark', {
            light: { primary: '#0066ff' },
        });

        expect(generator.destroy).toHaveBeenCalledOnce();
        expect(generator.create).not.toHaveBeenCalled();
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });

    it('preserves the last valid mode when variable generation fails', () => {
        document.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        vi.mocked(generator.create).mockImplementation(() => {
            throw new Error('Invalid theme');
        });

        expect(() => manager.apply('light', { light: { primary: 'invalid' } })).toThrow('Invalid theme');
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });
});

describe('applyTheme', () => {
    it('does nothing when no document is available', () => {
        vi.stubGlobal('document', undefined);

        expect(() => applyTheme('dark')).not.toThrow();
    });

    afterEach(() => vi.unstubAllGlobals());
});
