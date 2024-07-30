import { toChildArray } from 'preact';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { REFUND_REASONS, RefundReason, TransactionDataContext } from '../context';
import { boolOrFalse, EMPTY_ARRAY, noop } from '../../../../utils';
import { ButtonVariant } from '../../../internal/Button/types';
import useCoreContext from '../../../../core/Context/useCoreContext';
import type { ButtonActionObject, ButtonActionsList } from '../../../internal/Button/ButtonActions/types';
import type { TransactionDetailData } from '../types';

export interface TransactionDataProviderProps {
    children?: any;
    isFetching?: boolean;
    transaction: TransactionDetailData;
}

export const TransactionDataProvider = ({ children, isFetching, transaction }: TransactionDataProviderProps) => {
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

    return (
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
    );
};

export default TransactionDataProvider;
