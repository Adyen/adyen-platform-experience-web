/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { THEME_MODE_ATTRIBUTE } from '@integration-components/types/theme';
import { ThemeManager } from './ThemeManager';

const themeGenerator = vi.hoisted(() => ({ loaded: false, generateCSS: vi.fn() }));

vi.mock('@adyen/adyen-shared-web', () => {
    themeGenerator.loaded = true;
    return {
        ThemeGenerator: class {
            public generateCSS = themeGenerator.generateCSS;
        },
    };
});

const getThemeStyles = () => Array.from(document.head.querySelectorAll('style'), style => style.textContent);

describe('ThemeManager', () => {
    beforeEach(() => {
        document.head.innerHTML = '';
        themeGenerator.generateCSS.mockReset();
        themeGenerator.generateCSS.mockImplementation((variables: { primary?: string }) => `:root { --primary: ${variables.primary}; }`);
    });

    test('applies a theme without custom variables synchronously and without loading the theme generator', () => {
        const themeManager = new ThemeManager();
        const root = document.createElement('div');

        themeManager.register(root);
        void themeManager.apply('dark');

        expect(root.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
        expect(getThemeStyles()).toEqual([]);
        expect(themeGenerator.loaded).toBe(false);
    });

    test('applies custom theme variables once the theme generator loads', async () => {
        const themeManager = new ThemeManager();
        const root = document.createElement('div');
        themeManager.register(root);

        const applied = themeManager.apply('dark', { dark: { primary: '#84adff' } });

        expect(root.hasAttribute(THEME_MODE_ATTRIBUTE)).toBe(false);

        await applied;

        expect(themeGenerator.generateCSS).toHaveBeenCalledWith({ primary: '#84adff', dark: true }, expect.anything());
        expect(root.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
        expect(getThemeStyles()).toEqual([':root { --primary: #84adff; }']);
    });

    test('ignores a pending custom theme superseded by a later theme', async () => {
        const themeManager = new ThemeManager();
        const root = document.createElement('div');
        themeManager.register(root);

        const superseded = themeManager.apply('light', { light: { primary: '#0050b3' } });
        await themeManager.apply('dark');
        await superseded;

        expect(root.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
        expect(getThemeStyles()).toEqual([]);
    });

    test('still applies a pending custom theme when a later custom theme fails to generate', async () => {
        const themeManager = new ThemeManager();
        const root = document.createElement('div');
        themeManager.register(root);

        themeGenerator.generateCSS.mockImplementation((variables: { primary?: string }) => {
            if (variables.primary === 'invalid') throw new Error('Invalid hex color');
            return `:root { --primary: ${variables.primary}; }`;
        });

        const pending = themeManager.apply('dark', { dark: { primary: '#84adff' } });
        const failing = themeManager.apply('light', { light: { primary: 'invalid' } });

        await pending;
        await expect(failing).rejects.toThrow('Invalid hex color');

        expect(root.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
        expect(getThemeStyles()).toEqual([':root { --primary: #84adff; }']);
    });

    test('keeps the current theme when generating a custom theme fails', async () => {
        const themeManager = new ThemeManager();
        const root = document.createElement('div');
        themeManager.register(root);

        await themeManager.apply('dark', { dark: { primary: '#84adff' } });

        themeGenerator.generateCSS.mockImplementation(() => {
            throw new Error('Invalid hex color');
        });

        await expect(themeManager.apply('light', { light: { primary: 'invalid' } })).rejects.toThrow('Invalid hex color');

        expect(root.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
        expect(getThemeStyles()).toEqual([':root { --primary: #84adff; }']);
    });
});
