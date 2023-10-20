import { useMemo, useRef } from 'preact/hooks';

const useDefinedValue = <T = any>(fallbackFactory: () => T, value?: T) => {
    const rawValueRef = useRef(value ?? null);

    const definedValue = useMemo(() => {
        const currentValue = value ?? null;
        if (rawValueRef.current !== currentValue) rawValueRef.current = currentValue;
        return rawValueRef.current;
    }, [value]);

    return useMemo(() => definedValue ?? fallbackFactory(), [definedValue]);
};

export default useDefinedValue;
