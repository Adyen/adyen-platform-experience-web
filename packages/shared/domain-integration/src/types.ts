export type MaybePromise<Value> = Value | PromiseLike<Value>;
export type NoDependencies = Readonly<Record<PropertyKey, never>>;

export type DomainComponentCreateInput<Props, Dependencies> = Readonly<{
    dependencies: Dependencies;
    props: Props;
}>;

export interface DomainComponentInstance<Update = unknown, MountTarget = unknown> {
    mount(target: MountTarget): MaybePromise<void>;
    update(update: Update): MaybePromise<void>;
    unmount(): MaybePromise<void>;
}

export interface DomainComponentDefinition<Props = unknown, Dependencies = unknown, Update = unknown, MountTarget = unknown> {
    create(input: DomainComponentCreateInput<Props, Dependencies>): MaybePromise<DomainComponentInstance<Update, MountTarget>>;
}

export type DomainComponentScope = Readonly<{
    signal: AbortSignal;
}>;

export type DomainComponentBinding<Dependencies> = Readonly<{
    dependencies: Dependencies;
    dispose?: () => MaybePromise<void>;
}>;

export type CreateDomainComponentBinding<Dependencies> = (scope: DomainComponentScope) => MaybePromise<DomainComponentBinding<Dependencies>>;

export interface DomainComponentHandle<Update = unknown, MountTarget = unknown> {
    mount(target: MountTarget): Promise<void>;
    update(update: Update): Promise<void>;
    unmount(): Promise<void>;
}

export interface DomainComponentIntegration<Props = unknown, Update = unknown, MountTarget = unknown> {
    create(props: Props): Promise<DomainComponentHandle<Update, MountTarget>>;
}
