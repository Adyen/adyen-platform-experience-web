import { h } from 'preact';
import { uniqueId } from '../../../../../../utils';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CommitAction } from '../../../../../../hooks/useCommitAction';
import { TextFilterProps } from '../../../../../internal/FilterBar/filters/TextFilter/types';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import { FilterEditModalRenderProps } from '../../../../../internal/FilterBar/filters/BaseFilter/types';
import useFilterAnalyticsEvent from '../../../../../../hooks/useAnalytics/useFilterAnalyticsEvent';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import TextFilter from '../../../../../internal/FilterBar/filters/TextFilter';
import Typography from '../../../../../internal/Typography/Typography';
import InputBase from '../../../../../internal/FormFields/InputBase';
import './TransactionPspReferenceFilter.scss';

const BASE_CLASS = 'adyen-pe-psp-reference-filter';

const classes = {
    root: BASE_CLASS,
    info: BASE_CLASS + '__info',
    input: BASE_CLASS + '__input',
    title: BASE_CLASS + '__title',
} as const;

export interface TransactionPspReferenceFilterProps {
    eventCategory?: string;
    eventSubCategory?: string;
    onChange?: (value?: string) => void;
    value?: string;
}

const TransactionPspReferenceFilter = ({ eventCategory, eventSubCategory, onChange, value }: TransactionPspReferenceFilterProps) => {
    const { i18n } = useCoreContext();
    const { logEvent } = useFilterAnalyticsEvent({ category: eventCategory, subCategory: eventSubCategory, label: 'PSP reference filter' });
    const [pendingResetAction, setPendingResetAction] = useState(false);

    const label = useMemo(() => i18n.get('transactions.overview.filters.types.paymentPspReference.label'), [i18n]);
    const cachedValue = useRef(value);

    const onValueChange = useCallback<NonNullable<typeof onChange>>(
        value => {
            if (cachedValue.current !== value) {
                cachedValue.current = value;
                logEvent?.('update', null);
                onChange?.(value);
            }
        },
        [logEvent, onChange]
    );

    const onResetAction = useCallback(() => setPendingResetAction(true), []);

    useEffect(() => {
        if (!pendingResetAction) return;
        setPendingResetAction(false);
        if (cachedValue.current !== value) logEvent?.('reset');
    }, [pendingResetAction, value, logEvent]);

    return (
        <TextFilter
            aria-label={label}
            label={value ?? label}
            onChange={onValueChange}
            onResetAction={onResetAction}
            value={value}
            render={props => <TransactionPspReferenceFilter.EditModal {...props} />}
            name="pspReference"
        />
    );
};

TransactionPspReferenceFilter.EditModal = ({
    editAction,
    onChange,
    onValueUpdated,
    name,
    type,
    value,
}: FilterEditModalRenderProps<TextFilterProps>) => {
    const { i18n } = useCoreContext();
    const [currentValue, setCurrentValue] = useState(value);

    const firstInputElementRef = useRef<HTMLInputElement | null>(null);
    const inputId = useMemo(uniqueId, []);
    const labelId = useMemo(uniqueId, []);

    const label = useMemo(() => i18n.get('transactions.overview.filters.types.paymentPspReference.label'), [i18n]);
    const placeholder = useMemo(() => i18n.get('transactions.overview.filters.types.paymentPspReference.placeholder'), [i18n]);

    const handleInput = (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
        const inputElement = evt.currentTarget;
        const selectionEnd = inputElement.selectionEnd;
        const value = inputElement.value
            .replace(/[^a-z\d]/gi, '')
            .slice(0, 16)
            .toUpperCase();

        inputElement.value = value;
        inputElement.setSelectionRange(selectionEnd, selectionEnd);

        if (value !== currentValue) {
            setCurrentValue(value || undefined);
            onValueUpdated(value || undefined);
        }
    };

    useEffect(() => {
        switch (editAction) {
            case CommitAction.APPLY:
                onChange(currentValue);
                break;
            case CommitAction.CLEAR:
                onChange();
                break;
        }
    }, [editAction, onChange, currentValue]);

    useEffect(() => {
        if (firstInputElementRef.current) {
            firstInputElementRef.current.focus();
        }
    }, []);

    return (
        <div className={classes.root}>
            <div className={classes.title}>
                <label id={labelId} htmlFor={inputId}>
                    <Typography el={TypographyElement.DIV} variant={TypographyVariant.BODY} strongest>
                        {label}
                    </Typography>
                </label>
            </div>
            <div className={classes.input}>
                <InputBase
                    autoComplete="off"
                    uniqueId={inputId}
                    ref={firstInputElementRef}
                    placeholder={placeholder}
                    data-testid={name}
                    name={name}
                    type={type}
                    value={currentValue}
                    onInput={handleInput}
                />
            </div>
        </div>
    );
};

export default TransactionPspReferenceFilter;
