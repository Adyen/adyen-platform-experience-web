import { toChildArray } from 'preact';
import { useCallback, useLayoutEffect, useMemo, useState } from 'preact/hooks';
import { boolOrFalse, EMPTY_ARRAY, noop } from '../../../../utils';
import { ButtonVariant } from '../../../internal/Button/types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import TransactionDataSkeleton from '../components/TransactionDataSkeleton';
import { TransactionDataContext } from './TransactionDataContext';
import { REFUND_REASONS } from './constants';
import type { ButtonActionObject, ButtonActionsList } from '../../../internal/Button/ButtonActions/types';
import type { RefundReason, TransactionDataContextProviderProps } from './types';

export const TransactionDataContextProvider = ({ children, error, forceHideTitle, isFetching, transaction }: TransactionDataContextProviderProps) => {
    const [dataViewActive, setDataViewActive] = useState(true);
    const [refundReference, setRefundReference] = useState<string>();
    const [refundReason, setRefundReason] = useState<RefundReason>(REFUND_REASONS[0]);
    const [refundValueMax, setRefundValueMax] = useState(0);
    const [refundValue, setRefundValue] = useState(refundValueMax);

    const { i18n } = useCoreContext();

    const [refundButtonAction, showDataViewButtonAction, showRefundViewButtonAction] = useMemo(() => {
        let refundButtonAction: ButtonActionObject | undefined = undefined;
        let showDataViewButtonAction: ButtonActionObject | undefined = undefined;
        let showRefundViewButtonAction: ButtonActionObject | undefined = undefined;

        if (refundValueMax > 0) {
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
    }, [i18n, refundValueMax]);

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

    if (isLoading || !(transaction || error)) {
        return <TransactionDataSkeleton skeletonRowNumber={5} />;
    }

    return transaction ? (
        <TransactionDataContext.Provider
            value={{
                dataViewActive,
                isLoading,
                refundReason,
                refundReference,
                refundValue,
                refundValueMax,
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
