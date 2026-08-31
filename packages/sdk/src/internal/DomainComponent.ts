import type { CoreInstance } from '@integration-components/core/vue';
import type { DomainComponentHandle } from '@integration-components/domain-integration';
import type { ExternalComponentType } from '@integration-components/types';
import { uuid } from '@integration-components/utils';

type CreateHandle<Props extends object> = (props: Props) => Promise<DomainComponentHandle<Partial<Props>, Element | string>>;

export abstract class DomainComponent<Props extends object> {
    public readonly _id: string;
    public readonly core: CoreInstance;
    public props: Props;

    readonly #createHandle: CreateHandle<Props>;
    readonly #name: string;
    #handle: DomainComponentHandle<Partial<Props>, Element | string> | undefined;
    #lifecycle = Promise.resolve();
    #removed = false;

    protected constructor(
        core: CoreInstance,
        props: Props,
        public readonly type: ExternalComponentType,
        name: string,
        createHandle: CreateHandle<Props>
    ) {
        this._id = `${type}-${uuid()}`;
        this.core = core;
        this.props = props;
        this.#name = name;
        this.#createHandle = createHandle;
        this.core.registerComponent(this);
    }

    get elementRef(): null {
        return null;
    }

    mount(target: Element | string): Promise<void> {
        return this.#enqueue(async () => {
            if (this.#removed) throw new Error(`Cannot mount a removed ${this.#name}`);
            if (!this.#handle) this.#handle = await this.#createHandle(this.props);
            try {
                await this.#handle.mount(target);
            } catch (error) {
                await this.#unmount().catch(() => {});
                throw error;
            }
        });
    }

    unmount(): Promise<void> {
        return this.#enqueue(() => this.#unmount());
    }

    update(props: Partial<Props>): Promise<void> {
        return this.#enqueue(async () => {
            if (this.#removed) throw new Error(`Cannot update a removed ${this.#name}`);
            this.props = { ...this.props, ...props };
            await this.#handle?.update(props);
        });
    }

    updateCoreOptions(): void {
        // Core-owned state reaches the application binding through subscriptions.
    }

    remove(): Promise<void> {
        return this.#enqueue(async () => {
            if (this.#removed) return;
            this.#removed = true;
            try {
                await this.#unmount();
            } finally {
                this.core.remove(this);
            }
        });
    }

    async #unmount(): Promise<void> {
        const handle = this.#handle;
        this.#handle = undefined;
        await handle?.unmount();
    }

    #enqueue(operation: () => void | Promise<void>): Promise<void> {
        const result = this.#lifecycle.then(operation);
        this.#lifecycle = result.catch(() => {});
        return result;
    }
}
