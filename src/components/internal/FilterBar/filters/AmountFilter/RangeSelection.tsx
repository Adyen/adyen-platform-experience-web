import { FilterEditModalRenderProps } from '../BaseFilter/types';
import { RangeFilterBody } from './types';
import InputBase from '../../../FormFields/InputBase';
import './AmountFilter.scss';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { CommitAction } from '../../../../../hooks/useCommitAction';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { AMOUNT_MULTIPLIER } from './constants';
import { isUndefined } from '../../../../../utils';

export const RangeSelection = ({
    onChange,
    editAction,
    onValueUpdated,
    selectedCurrencies,
    availableCurrencies,
    value,
    ...props
}: FilterEditModalRenderProps<RangeFilterBody>) => {
    const { i18n } = useCoreContext();
    const firstInputElementRef = useRef<HTMLInputElement | null>(null);

    const [minAmount, setMinAmount] = useState<number | undefined>(
        !isUndefined(props.minAmount) ? parseFloat(props.minAmount) / AMOUNT_MULTIPLIER : undefined
    );
    const [maxAmount, setMaxAmount] = useState<number | undefined>(
        !isUndefined(props.maxAmount) ? parseFloat(props.maxAmount) / AMOUNT_MULTIPLIER : undefined
    );

    const applyFilter = useCallback(() => {
        onChange({ minAmount, maxAmount });
    }, [maxAmount, minAmount, onChange]);

    const clearFilter = useCallback(() => {
        onChange({ minAmount: undefined, maxAmount: undefined });
        setMaxAmount(undefined);
        setMinAmount(undefined);
    }, [onChange]);

    useEffect(() => {
        if (editAction === CommitAction.APPLY) applyFilter();
        if (editAction === CommitAction.CLEAR) clearFilter();
    }, [applyFilter, clearFilter, editAction]);

    const filterValue = useMemo(() => ({ minAmount: Number(minAmount), maxAmount: Number(maxAmount) }), [maxAmount, minAmount]);

    useEffect(() => {
        const { maxAmount, minAmount } = filterValue;
        if ((isUndefined(maxAmount) && isUndefined(minAmount)) || minAmount > maxAmount) {
            onValueUpdated(null);
        } else onValueUpdated(`${minAmount}-${maxAmount}`);
    }, [filterValue, onValueUpdated]);

    useEffect(() => {
        if (firstInputElementRef.current) {
            firstInputElementRef.current.focus();
        }
    }, []);

    return (
        <div className="adyen-pe-range-selection-filter">
            <div className="adyen-pe-range-selection-filter__input">
                <label htmlFor="minValue">{`${i18n.get('common.filters.types.amount.inputs.min.label')}:`}</label>
                <InputBase
                    ref={firstInputElementRef}
                    data-testid={'minValueFilter'}
                    lang={i18n.locale}
                    name={'minValue'}
                    type="number"
                    value={minAmount}
                    onInput={e => {
                        e.currentTarget && setMinAmount(e.currentTarget.value !== '' ? (e.currentTarget.value as any) : undefined);
                    }}
                    min={0}
                    isInvalid={minAmount ? minAmount < 0 : false}
                    errorMessage={i18n.get('common.filters.types.amount.errors.negative')}
                />
            </div>
            <div className="adyen-pe-range-selection-filter__input">
                <label htmlFor="maxValue">{`${i18n.get('common.filters.types.amount.inputs.max.label')}:`}</label>
                <InputBase
                    data-testid={'maxValueFilter'}
                    lang={i18n.locale}
                    name={'maxValue'}
                    type="number"
                    value={maxAmount}
                    onInput={e => {
                        e.currentTarget && setMaxAmount(e.currentTarget.value !== '' ? (e.currentTarget.value as any) : undefined);
                    }}
                    min={minAmount}
                    isInvalid={!isUndefined(maxAmount) && maxAmount < (minAmount ?? 0)}
                    errorMessage={i18n.get('common.filters.types.amount.errors.smallerMax')}
                />
            </div>
        </div>
    );
};
