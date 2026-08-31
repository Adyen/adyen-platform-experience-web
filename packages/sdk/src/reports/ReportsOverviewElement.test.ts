import { beforeEach, describe, expect, expectTypeOf, test, vi } from 'vitest';
import { bindReportsOverview } from './bindReportsOverview';
import { ReportsOverviewElement } from './ReportsOverviewElement';

const { create, handle } = vi.hoisted(() => {
    const handle = {
        mount: vi.fn(async () => {}),
        unmount: vi.fn(async () => {}),
        update: vi.fn(async () => {}),
    };
    return {
        create: vi.fn(async () => handle),
        handle,
    };
});

vi.mock('./bindReportsOverview', () => ({
    bindReportsOverview: vi.fn(() => ({ create })),
}));

describe('ReportsOverviewElement', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        create.mockResolvedValue(handle);
        handle.mount.mockResolvedValue();
        handle.unmount.mockResolvedValue();
        handle.update.mockResolvedValue();
    });

    test('adapts the SDK constructor and asynchronous lifecycle to the portable domain', async () => {
        const core = {
            registerComponent: vi.fn(),
            remove: vi.fn(),
        };
        const element = new ReportsOverviewElement({
            balanceAccountId: 'BA_1',
            core,
        } as never);

        expectTypeOf<ReturnType<typeof element.mount>>().toEqualTypeOf<Promise<void>>();
        await element.mount('#target');
        await element.unmount();
        await element.mount('#target');
        await element.update({ balanceAccountId: 'BA_2' });
        element.updateCoreOptions();
        await element.remove();

        expect(bindReportsOverview).toHaveBeenCalledWith(core);
        expect(create).toHaveBeenCalledWith({ balanceAccountId: 'BA_1' });
        expect(handle.mount).toHaveBeenCalledTimes(2);
        expect(handle.mount).toHaveBeenLastCalledWith('#target');
        expect(handle.update).toHaveBeenCalledWith({ balanceAccountId: 'BA_2' });
        expect(handle.unmount).toHaveBeenCalledTimes(2);
        expect(element.type).toBe('reports');
        expect(core.registerComponent).toHaveBeenCalledWith(element);
        expect(core.remove).toHaveBeenCalledWith(element);
    });

    test('cleans up a failed mount before allowing a fresh domain instance', async () => {
        const element = new ReportsOverviewElement({
            core: { registerComponent: vi.fn(), remove: vi.fn() },
        } as never);
        handle.mount.mockRejectedValueOnce(new Error('mount failed'));

        await expect(element.mount('#target')).rejects.toThrow('mount failed');
        await element.mount('#target');

        expect(handle.unmount).toHaveBeenCalledOnce();
        expect(create).toHaveBeenCalledTimes(2);
    });

    test('serializes mount and unmount and removes only once', async () => {
        let finishMount: (() => void) | undefined;
        handle.mount.mockImplementationOnce(() => new Promise<void>(resolve => (finishMount = resolve)));
        const core = { registerComponent: vi.fn(), remove: vi.fn() };
        const element = new ReportsOverviewElement({ core } as never);

        const mounting = element.mount('#target');
        const unmounting = element.unmount();
        await vi.waitFor(() => expect(finishMount).toBeTypeOf('function'));
        expect(handle.unmount).not.toHaveBeenCalled();
        finishMount?.();
        await Promise.all([mounting, unmounting]);
        await Promise.all([element.remove(), element.remove()]);

        expect(handle.unmount).toHaveBeenCalledOnce();
        expect(core.remove).toHaveBeenCalledOnce();
    });

    test('unregisters from Core when domain cleanup fails', async () => {
        const core = { registerComponent: vi.fn(), remove: vi.fn() };
        const element = new ReportsOverviewElement({ core } as never);
        handle.unmount.mockRejectedValueOnce(new Error('cleanup failed'));

        await element.mount('#target');
        await expect(element.remove()).rejects.toThrow('cleanup failed');

        expect(core.remove).toHaveBeenCalledWith(element);
    });
});
