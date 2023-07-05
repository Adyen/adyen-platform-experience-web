export type ReactiveStateRecord<Value = any, Param extends string = string> = Record<Param, Value | undefined>;
export type ReactiveStateUpdateRequestWithField<Value = any, Param extends string = string> = Partial<ReactiveStateRecord<Value, Param>>;
export type ReactiveStateUpdateRequest<Value = any, Param extends string = string> = ReactiveStateUpdateRequestWithField<Value, Param> | 'reset';

export interface UseReactiveStateRecord<Value = any, Param extends string = string> {
    canResetState: boolean;
    defaultState: Readonly<ReactiveStateRecord<Value, Param>>;
    resetState: () => void;
    state: Readonly<ReactiveStateRecord<Value, Param>>;
    stateVersion: number;
    updateState: (stateUpdateRequest: ReactiveStateUpdateRequestWithField<Value, Param>) => void;
}
