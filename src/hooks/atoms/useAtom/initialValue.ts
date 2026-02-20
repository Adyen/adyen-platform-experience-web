const $initialValue = Symbol();

export type OptionalInitialValueProps<T = undefined> = {
    deferredInitialValue?: boolean;
    initialValue?: T;
};

// prettier-ignore
export type RequiredInitialValueProps<T> =
    | { deferredInitialValue: true }
    | { initialValue: T };

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
