const $initialValue = Symbol();

export interface OptionalInitialValueProps<T = undefined> {
    deferredInitialValue?: boolean;
    initialValue?: T;
}

export type WithInitialValueProps<T> = { initialValue: T } | { deferredInitialValue: true };
export type WithoutInitialValueProps = { deferredInitialValue?: false };

export const isAwaitingInitialValue = <T = undefined>(props?: OptionalInitialValueProps<T>) => {
    return !!props?.deferredInitialValue;
};

export const isInitialValue = <T = undefined>(value: T | undefined) => {
    return value === $initialValue;
};

export const getInitialValue = <T = undefined>(props?: OptionalInitialValueProps<T>) => {
    return isAwaitingInitialValue(props) ? ($initialValue as unknown as T) : props?.initialValue;
};

export const getResolvedValue = <T = undefined>(value: T | undefined) => {
    return isInitialValue(value) ? undefined : value;
};
