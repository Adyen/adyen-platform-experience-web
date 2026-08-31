import type {
    CreateDomainComponentBinding,
    DomainComponentBinding,
    DomainComponentDefinition,
    DomainComponentHandle,
    DomainComponentInstance,
    DomainComponentIntegration,
} from './types';

const disposeBinding = async (binding: DomainComponentBinding<unknown> | undefined): Promise<void> => {
    try {
        await binding?.dispose?.();
    } catch {
        // Cleanup remains best effort so it cannot hide the original failure.
    }
};

const createHandle = <Update, MountTarget>(
    instance: DomainComponentInstance<Update, MountTarget>,
    abortController: AbortController,
    binding: DomainComponentBinding<unknown>
): DomainComponentHandle<Update, MountTarget> => {
    let disposed = false;

    const invoke = async (action: () => unknown): Promise<void> => {
        if (disposed) throw new Error('Domain instance has been unmounted.');
        await action();
    };

    return Object.freeze({
        mount: (target: MountTarget) => invoke(() => instance.mount(target)),
        update: (update: Update) => invoke(() => instance.update(update)),
        unmount: async () => {
            if (disposed) return;
            disposed = true;
            abortController.abort();

            try {
                await instance.unmount();
            } finally {
                await disposeBinding(binding);
            }
        },
    });
};

export const bindDomainComponent = <Props, Dependencies, Update, MountTarget>(
    definition: DomainComponentDefinition<Props, Dependencies, Update, MountTarget>,
    createBinding: CreateDomainComponentBinding<NoInfer<Dependencies>>
): DomainComponentIntegration<Props, Update, MountTarget> =>
    Object.freeze({
        create: async (props: Props) => {
            const abortController = new AbortController();
            let binding: DomainComponentBinding<Dependencies> | undefined;

            try {
                binding = await createBinding({ signal: abortController.signal });
                const instance = await definition.create({
                    dependencies: binding.dependencies,
                    props,
                });
                return createHandle(instance, abortController, binding);
            } catch (error) {
                abortController.abort();
                await disposeBinding(binding);
                throw error;
            }
        },
    });
