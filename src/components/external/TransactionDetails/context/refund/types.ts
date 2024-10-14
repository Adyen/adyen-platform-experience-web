import type { ILineItem } from '../../../../../types';
import type { RefundMode, RefundReason, TransactionDataContext, TransactionDataContextProviderProps } from '../types';

type _ITransactionRefundContextBase = TransactionDataContext<TransactionRefundProviderProps>;

export interface ITransactionRefundContext extends _ITransactionRefundContextBase {
    amount: number;
    availableItems: readonly ILineItem[];
    clearItems: (ids?: TransactionRefundItem['id'][]) => void;
    items: readonly TransactionRefundItem[];
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
    refundAmount: number;
    refundMode: RefundMode;
    refundReason: RefundReason;
    refundReference?: string;
    setAmount: (amount: number) => void;
    setRefundReason: (reason: RefundReason) => void;
    setRefundReference: (reference: string) => void;
}
