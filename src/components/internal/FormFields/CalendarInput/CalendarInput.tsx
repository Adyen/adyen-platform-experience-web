import { useState, useRef, useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { CalendarProps } from '../../Calendar/types';
import { DATE_FORMAT_DELIVERY_DATE } from '../../../../constants';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';
import { CalendarInputButton } from './components/CalendarInputButton';
import { CalendarInputPopover } from './components/CalendarInputPopover';

interface CalendarInputProps {
    clearable?: boolean;
    value?: string;
    onInput: (val: any) => void;
    isInvalid?: boolean;
    timezone?: string;
    isReadOnly?: boolean;
}

export function CalendarInput({ clearable, value, onInput, isInvalid, timezone, isReadOnly }: CalendarInputProps) {
    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timezone);
    const [open, setOpen] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | null>(null);

    const originDate = useMemo(() => (value ? [new Date(value)] : undefined), [value]);
    const label = useMemo(
        () => (value ? dateFormat(value, DATE_FORMAT_DELIVERY_DATE) : i18n.get('common.inputs.select.placeholder')),
        [dateFormat, i18n, value]
    );
    const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string | undefined>(value);
    const getGridLabel = useCallback<CalendarProps['getGridLabel']>(
        block => i18n.get('common.filters.types.date.calendar.label', { values: { monthOfYear: block.label } }),
        [i18n]
    );

    const onHighlight = useCallback(
        (from?: number) => {
            if (from) {
                const iso = new Date(from).toISOString();
                onInput(iso);
                setLastUpdatedTimestamp(iso);
                if (iso !== lastUpdatedTimestamp) setOpen(false);
            }
        },
        [lastUpdatedTimestamp, onInput]
    );

    const showClearButton = useMemo(() => !!clearable && !!value, [clearable, value]);

    const onClear = useCallback(
        (e?: Event) => {
            e?.preventDefault?.();
            e?.stopPropagation?.();
            onInput('');
            setLastUpdatedTimestamp(undefined);
            setOpen(false);
        },
        [onInput]
    );

    return (
        <div>
            <CalendarInputButton
                label={label}
                isOpen={open}
                isInvalid={isInvalid}
                onClick={() => setOpen(prev => !prev)}
                showClearButton={showClearButton}
                onClear={onClear}
                buttonRef={buttonRef}
                isReadOnly={isReadOnly}
            />
            <CalendarInputPopover
                isOpen={open}
                onClose={() => setOpen(false)}
                originDate={originDate}
                onHighlight={onHighlight}
                getGridLabel={getGridLabel}
                targetElement={buttonRef}
            />
        </div>
    );
}
