import type { WithPartialField } from '../../../../../utils/types';
import type { TransactionDetailData } from '../../types';
import type { TransactionLineItemWithQuantity } from '../types';

type _RequiredLineItemProps = Extract<keyof TransactionLineItemWithQuantity, 'id' | 'quantity'>;
type _OptionalLineItemProps = Exclude<keyof TransactionLineItemWithQuantity, _RequiredLineItemProps>;

export type UseRefundDetailsProps = {
    amount?: TransactionDetailData['amount']['value'];
    lineItems?: WithPartialField<TransactionLineItemWithQuantity, _OptionalLineItemProps>[];
    transaction?: TransactionDetailData;
};
