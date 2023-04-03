import { useMemo } from 'preact/hooks';
import InputBase from '../InputBase';
import { checkDateInputSupport, formatDate } from './utils';
import { InputBaseProps } from '../types';
import { TargetedEvent } from 'preact/compat';

export default function InputDate(props: InputBaseProps) {
    const isDateInputSupported = useMemo(checkDateInputSupport, []);

    const handleInput = (e: TargetedEvent<HTMLInputElement, Event>) => {
        if (e.target) (e.target as HTMLInputElement).value = formatDate((e.target as HTMLInputElement).value);
        props.onInput?.(e);
    };

    if (isDateInputSupported) {
        return <InputBase {...props} type="date" />;
    }

    return <InputBase {...props} onInput={handleInput} maxLength={10} />;
}
