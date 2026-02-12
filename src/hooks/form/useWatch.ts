import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { FieldValues, FormControl } from './types';

export function useWatch<TFieldValues>(control: FormControl<TFieldValues>, name: FieldValues<TFieldValues>) {
    const getCurrent = useCallback(() => control.getValue(name), [control, name]);
    const [value, setValue] = useState<any>(() => getCurrent());
    const prevRef = useRef<any>(value);

    useEffect(() => {
        const handleUpdate = () => {
            const next = getCurrent();
            if (prevRef.current !== next) {
                prevRef.current = next;
                setValue(next);
            }
        };
        handleUpdate();
        return control.subscribe(handleUpdate);
    }, [control, getCurrent, name]);

    return value;
}
