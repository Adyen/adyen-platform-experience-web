import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
import { REFUND_REASONS } from './constants';
import { EMPTY_ARRAY, EMPTY_OBJECT, noop } from '../../../../utils';
import { ITransactionDataContext } from './types';

export const TransactionDataContext = createContext<ITransactionDataContext>({
    dataViewActive: true,
    isLoading: true,
    refundReason: REFUND_REASONS[0],
    refundValue: 0,
    refundValueMax: 0,
    transaction: EMPTY_OBJECT as ITransactionDataContext['transaction'],
    updateRefundReason: noop,
    updateRefundReference: noop,
    updateRefundValue: noop,
    viewActions: EMPTY_ARRAY,
});

export const useTransactionDataContext = () => useContext(TransactionDataContext);
export default useTransactionDataContext;
