/**
 * @vitest-environment jsdom
 */
/* eslint-disable testing-library/render-result-naming-convention -- false positive: no render calls in this file */
import { afterEach, describe, expect, test, vi } from 'vitest';
import type { RenderHandle } from '../../types';
import type { Core } from '../../../../index';

const MockComponent = () => null;

describe('createCdnRenderer', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('renders a component into the container', async () => {
        const mockCore = {
            getCdnComponent: vi.fn().mockResolvedValue(MockComponent),
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        const handle = await renderer({ component: 'UnregisteredComponent', container });

        expect(handle).toHaveProperty('rerender');
        expect(handle).toHaveProperty('destroy');
    });

    test('calls getCdnComponent with component name', async () => {
        const getCdnComponent = vi.fn().mockResolvedValue(MockComponent);

        const mockCore = {
            getCdnComponent,
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        await renderer({ component: 'UnregisteredComponent', container });

        expect(getCdnComponent).toHaveBeenCalledWith({ name: 'UnregisteredComponent' });
    });

    test('destroy clears container content', async () => {
        const mockCore = {
            getCdnComponent: vi.fn().mockResolvedValue(MockComponent),
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        const handle = await renderer({ component: 'UnregisteredComponent', container });
        handle.destroy();

        expect(container.innerHTML).toBe('');
    });

    test('rerender updates component with new props', async () => {
        const mockCore = {
            getCdnComponent: vi.fn().mockResolvedValue(MockComponent),
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        const handle: RenderHandle<any> = await renderer({ component: 'UnregisteredComponent', container, props: { name: 'Alice' } });

        expect(() => handle.rerender({ name: 'Bob' })).not.toThrow();
    });

    test('handles when getCdnComponent returns null', async () => {
        const mockCore = {
            getCdnComponent: vi.fn().mockResolvedValue(null),
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        const handle = await renderer({ component: 'UnregisteredComponent', container });

        expect(handle).toHaveProperty('rerender');
        expect(handle).toHaveProperty('destroy');
        expect(container.innerHTML).toBe('');
    });

    test('rerender does nothing when component is null', async () => {
        const mockCore = {
            getCdnComponent: vi.fn().mockResolvedValue(null),
        } as unknown as Core;

        const { createCdnRenderer } = await import('./createCdnRenderer');
        const renderer = createCdnRenderer(mockCore);
        const container = document.createElement('div');

        // @ts-expect-error - Testing with unregistered component
        const handle: RenderHandle<any> = await renderer({ component: 'UnregisteredComponent', container });

        expect(() => handle.rerender({ name: 'Alice' })).not.toThrow();
        expect(container.innerHTML).toBe('');
    });
});
