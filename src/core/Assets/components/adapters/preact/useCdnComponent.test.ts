/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/preact';
import * as useCoreContextModule from '../../../../Context/useCoreContext';

const MockComponent = () => null;

describe('useCdnComponent', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test('returns loading state initially', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: vi.fn().mockReturnValue(new Promise(() => {})),
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        expect(result.current.loading).toBe(true);
        expect(result.current.component).toBeNull();
        expect(result.current.error).toBeNull();
    });

    test('returns loaded component on success', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: vi.fn().mockResolvedValue(MockComponent),
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.component).toBe(MockComponent);
        expect(result.current.error).toBeNull();
    });

    test('returns error on load failure', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: vi.fn().mockRejectedValue(new Error('CDN unavailable')),
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.component).toBeNull();
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('CDN unavailable');
    });

    test('wraps non-Error rejection in Error', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: vi.fn().mockRejectedValue('string error'),
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('string error');
    });

    test('calls getCdnComponent with the component name', async () => {
        const getCdnComponent = vi.fn().mockResolvedValue(MockComponent);

        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent,
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(getCdnComponent).toHaveBeenCalledWith({ name: 'UnregisteredComponent' });
        });
    });

    test('handles when getCdnComponent returns null', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: vi.fn().mockResolvedValue(null),
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.component).toBeNull();
        expect(result.current.error).toBeNull();
    });

    test('handles when getCdnComponent is undefined', async () => {
        vi.spyOn(useCoreContextModule, 'default').mockReturnValue({
            getCdnComponent: undefined,
        } as any);

        const { useCdnComponent } = await import('./useCdnComponent');
        // @ts-expect-error - Testing with unregistered component
        const { result } = renderHook(() => useCdnComponent('UnregisteredComponent'));

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.component).toBeNull();
        expect(result.current.error).toBeNull();
    });
});
