type ChainedScopePointer = 'next' | 'prev';

export type Scope<T = any> = ({ [K in ChainedScopePointer]: Scope<T> } & { data: T }) | null;

export type ScopeHandle<T = any> = {
    chained: boolean;
    data: NonNullable<Scope<T>>['data'];
    detach: (isolatedDetach?: boolean) => void;
};

export type ScopeChain<T = any> = Readonly<{
    add: (data?: T) => ScopeHandle<T>;
    current: Generator<Scope<T>, void, Scope<T> | undefined>;
    size: number;
}>;

export type ScopeChainOperation = <T = any>(scope: NonNullable<Scope<T>>, root?: Scope<T>, current?: Scope<T>) => readonly [Scope<T>, Scope<T>];
