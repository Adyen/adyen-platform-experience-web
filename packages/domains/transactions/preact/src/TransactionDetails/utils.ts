import { TagVariant } from '@integration-components/ui-components-preact/Tag/types';
import { TransactionDetails } from './types';

export { getAmountStyleForTransaction, getRefundTypeForTransaction } from '../../../domain/src';

export const getTagVariantForTransaction = (transaction?: TransactionDetails) => {
    switch (transaction?.status) {
        case 'Booked':
            return TagVariant.SUCCESS;
        case 'Reversed':
            return TagVariant.ERROR;
        default:
            return TagVariant.DEFAULT;
    }
};
