import { useEffect, useMemo, useState } from 'preact/hooks';
import { EditAction, FilterEditModalRenderProps, FilterProps } from '../BaseFilter/types';
import { DateFilterProps, DateRangeFilterParam } from './types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import BaseFilter from '../BaseFilter';
import Field from '../../../FormFields/Field';
import InputText from '../../../FormFields/InputText';
import Language from '../../../../../language';
import './DateFilter.scss';

const dateRangeFilterParams = [
    DateRangeFilterParam.FROM,
    DateRangeFilterParam.TO
] as const;

const computeDateFilterValue = (i18n: Language, fromDate?: string, toDate?: string) => {
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

        const [ handleFromInput, handleToInput, updateValueState ] = useMemo(() => {
            const updateValueState = (field: DateRangeFilterParam, value: string) => {
                const isFromField = field === DateRangeFilterParam.FROM;
                const setInputValue = isFromField ? setFromInputValue : setToInputValue;
                const setValue = isFromField ? setFromValue : setToValue;

                setInputValue(value);
                setValue(resolveDate(value));
            };

            const handleInput = (field: DateRangeFilterParam) => (e: Event) => {
                updateValueState(field, (e.target as HTMLInputElement).value.trim());
            };

            return [
                handleInput(DateRangeFilterParam.FROM),
                handleInput(DateRangeFilterParam.TO),
                updateValueState
            ];
        }, []);

        useEffect(() => {
            onValueUpdated(computeDateFilterValue(i18n, fromValue, toValue));
        }, [i18n, fromValue, toValue, onValueUpdated]);

        useEffect(() => {
            if (editAction === EditAction.CLEAR) {
                dateRangeFilterParams.forEach(field => updateValueState(field, ''));
            }

            if (editAction === EditAction.APPLY) {
                onChange({
                    [DateRangeFilterParam.FROM]: fromValue,
                    [DateRangeFilterParam.TO]: toValue
                });
            }
        }, [editAction, fromValue, toValue, onChange, updateValueState]);

        return <>
            <Field label={i18n.get('from')} name={'from'}>
                <InputText name={'from'} value={fromInputValue} onInput={handleFromInput} />
            </Field>
            <Field label={i18n.get('to')} name={'to'}>
                <InputText name={'to'} value={toInputValue} onInput={handleToInput} />
            </Field>
        </>;
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
