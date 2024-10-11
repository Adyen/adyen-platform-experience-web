import { useMemo } from 'preact/hooks';
import { EMPTY_ARRAY } from '../../../../../utils';
import { FULLY_REFUNDABLE_ONLY, NON_REFUNDABLE, PARTIALLY_REFUNDABLE_ANY_AMOUNT, PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED } from '../constants';
import { getDecimalAmount } from '../../../../../core/Localization/amount/amount-util';
import type { TransactionLineItemWithQuantity } from '../types';
import type { UseRefundDetailsProps } from './types';

export const useRefundDetails = ({ amount, lineItems, transaction }: UseRefundDetailsProps) => {
    const refundableAmount = useMemo(() => {
        if (transaction) {
            const { currency, value } = transaction.refundDetails.refundableAmount;
            return getDecimalAmount(value, currency);
        }
        return 0;
    }, [transaction]);

    const refundMode = useMemo(() => transaction?.refundDetails.refundMode ?? FULLY_REFUNDABLE_ONLY, [transaction]);

    const refundLineItems = useMemo<Readonly<Readonly<TransactionLineItemWithQuantity>[]>>(() => {
        if (!transaction?.lineItems || refundMode !== PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED) return EMPTY_ARRAY;

        const _lineItemEntriesWithQuantities = lineItems
            ?.filter(({ quantity }) => Number.isFinite(quantity) && quantity > 0)
            .map(({ id, quantity }) => [id, quantity] as const);

        const itemQuantities = new Map(_lineItemEntriesWithQuantities ?? EMPTY_ARRAY);
        const items = new Map<string, Readonly<TransactionLineItemWithQuantity>>();

        for (const lineItem of transaction.lineItems) {
            const quantity = itemQuantities.get(lineItem.id);
            if (!quantity) continue;

            items.delete(lineItem.id);

            if (quantity <= lineItem.availableQuantity) {
                items.set(lineItem.id, Object.freeze({ ...lineItem, quantity }));
            }
        }

        return Object.freeze([...items.values()]);
    }, [lineItems, refundMode, transaction]);

    const refundAmount = useMemo(() => {
        switch (refundMode) {
            case NON_REFUNDABLE:
                return 0;
            case PARTIALLY_REFUNDABLE_ANY_AMOUNT:
                return amount ?? refundableAmount;
            case PARTIALLY_REFUNDABLE_WITH_LINE_ITEMS_REQUIRED:
                return refundLineItems.reduce((amount, { amountIncludingTax, quantity }) => amount + amountIncludingTax.value * quantity, 0);
            case FULLY_REFUNDABLE_ONLY:
            default:
                return refundableAmount;
        }
    }, [amount, refundableAmount, refundLineItems, refundMode]);

    return { refundableAmount, refundAmount, refundLineItems, refundMode } as const;
};

export default useRefundDetails;
