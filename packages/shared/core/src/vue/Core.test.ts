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
        theme: {
            mode: 'dark',
            variables: { primary: '#0066ff' },
        },
    });

describe('Vue Core theme lifecycle', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('applies the initial theme once', () => {
        createCore();

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith({
            mode: 'dark',
            variables: { primary: '#0066ff' },
        });
    });

    it('applies the light default when the initial theme is omitted', () => {
        new Core({
            locale: 'en-US',
            onSessionCreate: vi.fn(),
        });

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith(undefined);
    });

    it('preserves the current theme when an update omits theme', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ locale: 'de-DE' });

        expect(applyTheme).not.toHaveBeenCalled();
        expect(core.options.theme).toEqual({
            mode: 'dark',
            variables: { primary: '#0066ff' },
        });
    });

    it('resets to light when an update explicitly sets theme to undefined', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ theme: undefined });

        expect(applyTheme).toHaveBeenCalledOnce();
        expect(applyTheme).toHaveBeenCalledWith(undefined);
        expect(core.options.theme).toBeUndefined();
    });

    it('replaces the complete theme object during an update', async () => {
        const core = createCore();
        vi.mocked(applyTheme).mockClear();

        await core.update({ theme: { mode: 'light' } });

        expect(applyTheme).toHaveBeenCalledWith({ mode: 'light' });
        expect(core.options.theme).toEqual({ mode: 'light' });
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

        await expect(core.update({ theme: { variables: { primary: 'invalid' } } })).rejects.toThrow('Invalid theme');
        expect(core.options.theme).toEqual({
            mode: 'dark',
            variables: { primary: '#0066ff' },
        });
        expect(component.update).not.toHaveBeenCalled();
    });
});
