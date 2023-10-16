type ChainedScopePointer = 'next' | 'prev';

export type Scope<T extends {} = {}> = ({ [K in ChainedScopePointer]: Scope<T> } & T) | null;

export type ScopeProxy<T extends {} = {}> = Omit<NonNullable<Scope<T>>, ChainedScopePointer> &
    Readonly<Pick<NonNullable<Scope<T>>, ChainedScopePointer>> & { chained: boolean };

export type ScopeChain<T extends {} = {}> = Readonly<{
    add: (data?: T) => Readonly<[ScopeProxy<T>, (isolatedDetach?: boolean) => void]>;
    current: Generator<Scope<T>, void, Scope<T> | undefined>;
}>;

export type ScopeChainOperation = <T extends {} = {}>(
    scope: NonNullable<Scope<T>>,
    root?: Scope<T>,
    current?: Scope<T>
) => readonly [Scope<T>, Scope<T>];
