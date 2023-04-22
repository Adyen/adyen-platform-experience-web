export type ReactiveStateRecord<V extends any = any, K extends string = string> = Record<K, V | undefined>;
export type ReactiveStateUpdateRequestWithField<V extends any = any, K extends string = string> = Partial<ReactiveStateRecord<V, K>>;
export type ReactiveStateUpdateRequest<V extends any = any, K extends string = string> = ReactiveStateUpdateRequestWithField<V, K> | 'reset';

export interface UseReactiveStateRecord<V extends any = any, K extends string = string> {
    canResetState: boolean;
    defaultState: Readonly<ReactiveStateRecord<V, K>>;
    resetState: () => void;
    state: Readonly<ReactiveStateRecord<V, K>>;
    updateState: (stateUpdateRequest: ReactiveStateUpdateRequestWithField<V, K>) => void;
}
