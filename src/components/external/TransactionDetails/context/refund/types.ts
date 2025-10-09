import type { TransactionDetailData } from '../../types';
import type { ILineItem, IRefundMode } from '../../../../../types';
import type { RefundReason, TransactionDataContext, TransactionDataContextProviderProps } from '../types';

type _ITransactionRefundContextBase = TransactionDataContext<Omit<TransactionRefundProviderProps, 'refreshTransaction'>>;

export interface ITransactionRefundContext extends _ITransactionRefundContextBase {
    amount: number;
    availableItems: readonly ILineItem[];
    clearItems: (ids?: TransactionRefundItem['id'][]) => void;
    interactionsDisabled: boolean;
    items: readonly TransactionRefundItem[];
    refundReason: RefundReason;
    setAmount: (amount: number) => void;
    setRefundReason: (reason: RefundReason) => void;
    updateItems: (itemUpdates?: TransactionRefundItemUpdates) => void;
}

export type TransactionRefundItem = Readonly<{
    id: ILineItem['id'];
    amount: ILineItem['amountIncludingTax']['value'];
    quantity: ILineItem['availableQuantity'];
}>;

export type TransactionRefundItemUpdates = Readonly<Omit<TransactionRefundItem, 'amount'> & Pick<Partial<TransactionRefundItem>, 'amount'>>[];

export interface TransactionRefundProviderProps extends TransactionDataContextProviderProps {
    availableAmount: number;
    currency: string;
    refreshTransaction: () => void;
    refundMode: IRefundMode;
    transactionId: TransactionDetailData['id'];
    transactionOriginalAmount: TransactionDetailData['originalAmount'];
}
