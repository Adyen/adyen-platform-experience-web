export type Scope<T = any> =
    | ({
          next: Set<ScopeWithPrev<T>> | null;
          prev: Scope<T>;
      } & { data: T })
    | null;

export type ScopeWithPrev<T = any> = {
    prev: NonNullable<Scope<T>>;
} & Omit<NonNullable<Scope<T>>, 'prev'>;

export type ScopeHandle<T = any> = Readonly<{
    _scope: Scope<T>;
    attached: boolean;
    data: NonNullable<Scope<T>>['data'];
    detach: (isolatedDetach?: boolean) => void;
}>;

export type ScopeTree<T = any> = Readonly<{
    add: (data?: T, parent?: Scope<T>) => ScopeHandle<T>;
    trace: (scope?: Scope<T>) => Generator<Scope<T>, void, Scope<T> | undefined>;
}>;
