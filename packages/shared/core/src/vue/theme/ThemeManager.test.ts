/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ThemeProps } from '@adyen/adyen-shared-web';
import { ThemeManager, applyTheme, THEME_MODE_ATTRIBUTE } from './ThemeManager';
import type { ThemeStyleGenerator } from './ThemeGeneratorAdapter';

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
        manager = new ThemeManager(document, generator);
    });

    it('uses the light Bento defaults when the theme is undefined', () => {
        document.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');

        manager.apply(undefined);

        expect(generator.destroy).toHaveBeenCalledOnce();
        expect(document.documentElement.hasAttribute(THEME_MODE_ATTRIBUTE)).toBe(false);
    });

    it('uses the dark Bento defaults without generating brand variables', () => {
        manager.apply({ mode: 'dark' });

        expect(generator.destroy).toHaveBeenCalledOnce();
        expect(generator.create).not.toHaveBeenCalled();
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });

    it('generates dark brand variables after selecting the dark Bento defaults', () => {
        manager.apply({ mode: 'dark', variables: { primary: '#0066ff' } });

        expect(generator.create).toHaveBeenCalledWith({
            primary: '#0066ff',
            dark: true,
        } satisfies ThemeProps);
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });

    it('replaces a dark custom theme with a complete light custom theme', () => {
        manager.apply({ mode: 'dark', variables: { primary: '#0066ff' } });
        manager.apply({ variables: { background: '#ffffff' } });

        expect(generator.create).toHaveBeenLastCalledWith({
            background: '#ffffff',
            dark: false,
        } satisfies ThemeProps);
        expect(document.documentElement.hasAttribute(THEME_MODE_ATTRIBUTE)).toBe(false);
    });

    it('preserves the last valid mode when variable generation fails', () => {
        document.documentElement.setAttribute(THEME_MODE_ATTRIBUTE, 'dark');
        vi.mocked(generator.create).mockImplementation(() => {
            throw new Error('Invalid theme');
        });

        expect(() => manager.apply({ variables: { primary: 'invalid' } })).toThrow('Invalid theme');
        expect(document.documentElement.getAttribute(THEME_MODE_ATTRIBUTE)).toBe('dark');
    });
});

describe('applyTheme', () => {
    it('does nothing when no document is available', () => {
        expect(() => applyTheme({ mode: 'dark' }, undefined)).not.toThrow();
    });
});
