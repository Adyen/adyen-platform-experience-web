const $initialValue = Symbol();

export type InitialValue = typeof $initialValue;

export type OptionalInitialValueProps<T = undefined> = {
    deferredInitialValue?: boolean;
    initialValue?: T;
};

export type WithoutInitialValueProps = { deferredInitialValue?: false };

export const isAwaitingInitialValue = <T = undefined>(props?: OptionalInitialValueProps<T>) => {
    return !!props?.deferredInitialValue;
};

export const isInitialValue = (value: unknown): value is InitialValue => {
    return value === $initialValue;
};

export const getInitialValue = <T = undefined>(props?: OptionalInitialValueProps<T>): T | InitialValue | undefined => {
    return isAwaitingInitialValue(props) ? $initialValue : props?.initialValue;
};

export const getResolvedValue = <T = undefined>(value: T | InitialValue | undefined): T | undefined => {
    return isInitialValue(value) ? undefined : value;
};
