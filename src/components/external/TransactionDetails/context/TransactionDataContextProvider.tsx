import { toChildArray } from 'preact';
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'preact/hooks';
import { boolOrFalse, EMPTY_ARRAY, noop } from '../../../../utils';
import { ButtonVariant } from '../../../internal/Button/types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import DataOverviewDetailsSkeleton from '../../../internal/DataOverviewDetails/DataOverviewDetailsSkeleton';
import { TransactionDataContext } from './TransactionDataContext';
import { REFUND_REASONS } from './constants';
import useRefundDetails from './useRefundDetails';
import type { ButtonActionObject, ButtonActionsList } from '../../../internal/Button/ButtonActions/types';
import type { RefundReason, TransactionDataContextProviderProps } from './types';

export const TransactionDataContextProvider = ({ children, error, forceHideTitle, isFetching, transaction }: TransactionDataContextProviderProps) => {
    const { i18n } = useCoreContext();
    const [dataViewActive, setDataViewActive] = useState(true);
    const [refundReason, setRefundReason] = useState<RefundReason>(REFUND_REASONS[0]);
    const [refundReference, setRefundReference] = useState<string>();
    const [refundValue, setRefundValue] = useState(0);

    const { refundableAmount } = useRefundDetails({ transaction, amount: refundValue });

    const [refundButtonAction, showDataViewButtonAction, showRefundViewButtonAction] = useMemo(() => {
        let refundButtonAction: ButtonActionObject | undefined = undefined;
        let showDataViewButtonAction: ButtonActionObject | undefined = undefined;
        let showRefundViewButtonAction: ButtonActionObject | undefined = undefined;

        if (refundableAmount > 0) {
            refundButtonAction = Object.freeze({
                disabled: false,
                event: noop /* [TODO]: Replace with refund action */,
                title: i18n.get('refundAction'),
                variant: ButtonVariant.PRIMARY,
            });

            showDataViewButtonAction = Object.freeze({
                disabled: false,
                event: () => setDataViewActive(true),
                title: i18n.get('closeIconLabel'),
                variant: ButtonVariant.SECONDARY,
            });

            showRefundViewButtonAction = Object.freeze({
                disabled: false,
                event: () => setDataViewActive(false),
                title: i18n.get('refundAction'),
                variant: ButtonVariant.PRIMARY,
            });
        }

        return [refundButtonAction, showDataViewButtonAction, showRefundViewButtonAction] as const;
    }, [i18n, refundableAmount]);

    const viewActions = useMemo<ButtonActionsList>(() => {
        const actions = (dataViewActive ? [showRefundViewButtonAction!] : [refundButtonAction!, showDataViewButtonAction!]).filter(Boolean);
        return actions.length ? Object.freeze(actions) : EMPTY_ARRAY;
    }, [dataViewActive, refundButtonAction, showDataViewButtonAction, showRefundViewButtonAction]);

    const isLoading = boolOrFalse(isFetching);

    // [TODO]: Add proper validation
    const updateRefundReason = useCallback((reason: RefundReason) => void (!dataViewActive && setRefundReason(reason)), [dataViewActive]);

    const updateRefundReference = useCallback(
        (reference: string) => void (!dataViewActive && setRefundReference(reference || undefined)),
        [dataViewActive]
    );

    const updateRefundValue = useCallback((value: number) => void (!dataViewActive && setRefundValue(value)), [dataViewActive]);

    useLayoutEffect(() => {
        forceHideTitle?.(!dataViewActive);
    }, [dataViewActive, forceHideTitle]);

    useEffect(() => {
        setRefundValue(refundableAmount);
    }, [refundableAmount]);

    if (isLoading || !(transaction || error)) {
        return <DataOverviewDetailsSkeleton skeletonRowNumber={5} />;
    }

    return transaction ? (
        <TransactionDataContext.Provider
            value={{
                dataViewActive,
                isLoading,
                refundReason,
                refundReference,
                refundValue,
                refundValueMax: refundableAmount,
                transaction,
                updateRefundReason,
                updateRefundReference,
                updateRefundValue,
                viewActions,
            }}
        >
            {toChildArray(children)}
        </TransactionDataContext.Provider>
    ) : null;
};

export default TransactionDataContextProvider;
