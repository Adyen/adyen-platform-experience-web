import { useMemo, useRef } from 'preact/hooks';
import { isFunction } from '../utils';

const useDefinedValue = <T = any>(fallback: T | (() => T), value?: T | null) => {
    const rawValueRef = useRef(value ?? null);
    const fallbackFactory = useMemo(() => (isFunction(fallback) ? fallback : () => fallback), [fallback]);

    const definedValue = useMemo(() => {
        const currentValue = value ?? null;
        if (rawValueRef.current !== currentValue) rawValueRef.current = currentValue;
        return rawValueRef.current;
    }, [value]);

    return useMemo(() => definedValue ?? fallbackFactory(), [definedValue]);
};

export default useDefinedValue;
