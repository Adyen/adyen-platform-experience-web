export type Scope<T extends {} = {}> = ({ [K in 'next' | 'prev']: Scope<T> } & T) | null;

export type ScopeChain<T extends {} = {}> = Readonly<{
    add: (data?: T) => (isolatedDetach?: boolean) => void;
    current: Generator<Scope<T>, void, Scope<T> | undefined>;
}>;

export type ScopeChainOperation = <T extends {} = {}>(
    scope: NonNullable<Scope<T>>,
    root?: Scope<T>,
    current?: Scope<T>
) => readonly [Scope<T>, Scope<T>];
