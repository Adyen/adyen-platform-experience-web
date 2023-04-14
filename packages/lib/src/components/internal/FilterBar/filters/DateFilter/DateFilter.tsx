import { useCallback, useEffect, useMemo, useState } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import { DateFilterProps } from './types';
import './DateFilter.scss';

const computeDateFilterValue = (i18n, fromDate?: string, toDate?: string) => {
    const from = fromDate && i18n.fullDate(fromDate);
    const to = toDate && i18n.fullDate(toDate);

    if (from && to) return `${from} - ${to}`;
    if (from) return i18n.get('filter.date.since', { values: { date: from } });
    if (to) return i18n.get('filter.date.until', { values: { date: to } });
};

const resolveDate = (date?: any) => {
    try { if (date) return new Date(date).toISOString(); }
    catch (e) { /* invalid date: fallback to empty string */ }
    return '';
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { editAction, from, to, onChange, onValueUpdated } = props;

        const { i18n } = useCoreContext();
        const [ fromValue, setFromValue ] = useState(from);
        const [ toValue, setToValue ] = useState(to);
        const [ fromInputValue, setFromInputValue ] = useState(() => from && i18n.fullDate(from));
        const [ toInputValue, setToInputValue ] = useState(() => to && i18n.fullDate(to));

        const updateValueState = useCallback((field: 'from' | 'to', value: string) => {
            const isFromField = field === 'from';
            const setInputValue = isFromField ? setFromInputValue : setToInputValue;
            const setValue = isFromField ? setFromValue : setToValue;

            setInputValue(value);
            setValue(resolveDate(value));
        }, [setFromInputValue, setFromValue, setToInputValue, setToValue]);

        const handleInput = useCallback((e: Event, field: 'from' | 'to') => {
            updateValueState(field, (e.target as HTMLInputElement).value.trim());
        }, [updateValueState]);

        const handleFromInput = useCallback((e: Event) => handleInput(e, 'from'), [handleInput]);
        const handleToInput = useCallback((e: Event) => handleInput(e, 'to'), [handleInput]);

        useEffect(() => {
            onValueUpdated(computeDateFilterValue(i18n, fromValue, toValue));
        }, [i18n, fromValue, toValue, onValueUpdated]);

        useEffect(() => {
            if (editAction === EditAction.CLEAR) {
                (['from', 'to'] as const).forEach(field => updateValueState(field, ''));
            }

            // [TODO]: Define this requirement somewhere else and pass it as prop
            // Only update filters when both from and to dates are defined
            if (editAction === EditAction.APPLY && fromValue && toValue) {
                onChange({
                    createdSince: fromValue,
                    createdUntil: toValue
                });
            }
        }, [editAction, fromValue, toValue, onChange, updateValueState]);

        return (
            <>
                <Field label={i18n.get('from')} name={'from'}>
                    <InputText name={'from'} value={fromInputValue} onInput={handleFromInput} />
                </Field>
                <Field label={i18n.get('to')} name={'to'}>
                    <InputText name={'to'} value={toInputValue} onInput={handleToInput} />
                </Field>
            </>
        );
    };

    return (props: FilterEditModalRenderProps<DateFilterProps>) => <DateFilterEditModalBody {...props} />;
})();

export default function DateFilter<T extends DateFilterProps = DateFilterProps>(props: FilterProps<T>) {
    const { from, to } = props;

    const { i18n } = useCoreContext();
    const fromDate = useMemo(() => resolveDate(from), [from]);
    const toDate = useMemo(() => resolveDate(to), [to]);
    const value = useMemo(() => computeDateFilterValue(i18n, fromDate, toDate), [i18n, fromDate, toDate]);

    return <BaseFilter<T>
        {...props}
        from={fromDate}
        to={toDate}
        value={value}
        type={'date'}
        render={renderDateFilterModalBody} />;
}
