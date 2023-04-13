import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
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
    try { if (date) return new Date(date).toISOString(); } catch (e) {}
    return '';
};

const renderDateFilterModalBody = (() => {
    const DateFilterEditModalBody = (props: FilterEditModalRenderProps<DateFilterProps>) => {
        const { editAction, from, to, onChange, onValueUpdated } = props;

        const { i18n } = useCoreContext();
        const fromValue = useRef(from);
        const toValue = useRef(to);
        const initialFrom = useMemo(() => from && i18n.fullDate(from), [i18n, from]);
        const initialTo = useMemo(() => to && i18n.fullDate(to), [i18n, to]);

        const handleInput = useCallback((e: Event, field: 'from' | 'to') => {
            try {
                const value = new Date((e.target as HTMLInputElement).value).toISOString();

                field === 'from'
                    ? fromValue.current = value
                    : toValue.current = value;
            } catch (e) {
                // Use value from props given invalid date input
                field === 'from'
                    ? fromValue.current = from
                    : toValue.current = to;
            }

            onValueUpdated(computeDateFilterValue(i18n, fromValue.current, toValue.current));
        }, [i18n, from, to, onValueUpdated]);

        const handleFromInput = useCallback((e: Event) => handleInput(e, 'from'), [handleInput]);
        const handleToInput = useCallback((e: Event) => handleInput(e, 'to'), [handleInput]);

        useEffect(() => {
            // // [TODO]: Need to revisit this behaviour and agree on proper handling
            // // Prevent clearing date filter since it is required
            // if (editAction === EditAction.CLEAR) {
            //     fromValue.current = toValue.current = '';
            //     onValueUpdated(computeDateFilterValue(i18n));
            // }
            //
            // if (editAction !== EditAction.NONE) {
            //     onChange({
            //         createdSince: fromValue.current,
            //         createdUntil: toValue.current
            //     });
            // }

            // Only update filters when both from and to dates are defined
            if (editAction === EditAction.APPLY && fromValue.current && toValue.current) {
                onChange({
                    createdSince: fromValue.current,
                    createdUntil: toValue.current
                });
            }
        }, [i18n, editAction, onChange, onValueUpdated]);

        return (
            <>
                <Field label={i18n.get('from')} name={'from'}>
                    <InputText name={'from'} value={initialFrom} onInput={handleFromInput} />
                </Field>
                <Field label={i18n.get('to')} name={'to'}>
                    <InputText name={'to'} value={initialTo} onInput={handleToInput} />
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
