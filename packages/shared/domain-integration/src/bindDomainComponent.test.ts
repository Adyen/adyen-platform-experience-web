import { describe, expect, expectTypeOf, test, vi } from 'vitest';
import { bindDomainComponent } from './bindDomainComponent';
import type { DomainComponentDefinition, NoDependencies } from './types';

type Dependencies = Readonly<{
    format?: (key: string) => string;
    load: () => Promise<string>;
}>;

describe('bindDomainComponent', () => {
    test('passes domain-owned dependencies and delegates lifecycle', async () => {
        const instance = { mount: vi.fn(), unmount: vi.fn(), update: vi.fn() };
        const create = vi.fn((_input: { dependencies: Dependencies; props: { initial: string } }) => instance);
        const definition: DomainComponentDefinition<{ initial: string }, Dependencies, { next: string }, string> = { create };
        const load = vi.fn(async () => 'loaded');
        const dispose = vi.fn();

        let signal: AbortSignal | undefined;

        const integration = bindDomainComponent(definition, scope => {
            signal = scope.signal;
            return { dependencies: { load }, dispose };
        });

        const handle = await integration.create({ initial: 'value' });

        expectTypeOf(handle.mount).returns.toEqualTypeOf<Promise<void>>();
        expectTypeOf(handle.update).returns.toEqualTypeOf<Promise<void>>();
        expectTypeOf(handle.unmount).returns.toEqualTypeOf<Promise<void>>();

        await handle.mount('#target');
        await handle.update({ next: 'update' });
        await handle.unmount();
        await handle.unmount();

        expect(create).toHaveBeenCalledWith({
            dependencies: { load },
            props: { initial: 'value' },
        });
        expect(instance.mount).toHaveBeenCalledWith('#target');
        expect(instance.update).toHaveBeenCalledWith({ next: 'update' });
        expect(instance.unmount).toHaveBeenCalledOnce();
        expect(signal?.aborted).toBe(true);
        expect(dispose).toHaveBeenCalledOnce();
    });

    test('aborts and disposes a binding when domain creation fails', async () => {
        let signal: AbortSignal | undefined;
        const dispose = vi.fn();

        const definition: DomainComponentDefinition<NoDependencies, Dependencies> = {
            create: () => {
                throw new Error('domain failed');
            },
        };

        const integration = bindDomainComponent(definition, scope => {
            signal = scope.signal;
            return { dependencies: { load: async () => 'loaded' }, dispose };
        });

        await expect(integration.create({})).rejects.toThrow('domain failed');
        expect(signal?.aborted).toBe(true);
        expect(dispose).toHaveBeenCalledOnce();
    });

    test('rejects mount and update after unmount', async () => {
        const definition: DomainComponentDefinition<NoDependencies, NoDependencies> = {
            create: () => ({ mount: () => {}, unmount: () => {}, update: () => {} }),
        };

        const handle = await bindDomainComponent(definition, () => ({ dependencies: {} })).create({});
        await handle.unmount();

        await expect(handle.mount(undefined)).rejects.toThrow('Domain instance has been unmounted.');
        await expect(handle.update(undefined)).rejects.toThrow('Domain instance has been unmounted.');
    });

    test('requires bindings to provide the declared dependencies', () => {
        const definition: DomainComponentDefinition<{ value: string }, { required: string }> = {
            create: () => ({ mount: () => {}, unmount: () => {}, update: () => {} }),
        };

        // @ts-expect-error The domain requires a string dependency.
        bindDomainComponent(definition, () => ({ dependencies: {} }));

        const dependencyFreeDefinition: DomainComponentDefinition<NoDependencies, NoDependencies> = {
            create: () => ({ mount: () => {}, unmount: () => {}, update: () => {} }),
        };

        // @ts-expect-error Dependency-free domains reject undeclared dependencies.
        bindDomainComponent(dependencyFreeDefinition, () => ({ dependencies: { unexpected: true } }));
    });
});
