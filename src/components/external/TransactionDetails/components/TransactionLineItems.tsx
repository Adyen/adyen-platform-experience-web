import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { ITransactionLineItem } from '../../../../types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import { TX_DATA_CONTAINER } from '../constants';
import { ActiveView } from '../context/types';
import useLineItemRefundData from '../context/useLineItemRefundData';
import TransactionLineItem from './TransactionLineItem';

const TransactionLineItems = ({ view }: { view: ActiveView }) => {
    const { i18n } = useCoreContext();
    const { availableItems, refundedItems, failedItems, inProgressItems } = useLineItemRefundData(view);

    console.log('lineItems');
    return useMemo(() => {
        return (
            <div className={`${TX_DATA_CONTAINER}`}>
                <Typography variant={TypographyVariant.BODY}>{i18n.get('orderItem')}</Typography>
                {availableItems &&
                    Boolean(availableItems.length) &&
                    availableItems.map((lineItem: ITransactionLineItem) => (
                        <TransactionLineItem
                            {...lineItem}
                            status={'available'}
                            showCheckbox={view === ActiveView.REFUND}
                            key={`${lineItem.id}-available`}
                        />
                    ))}
                {refundedItems &&
                    Boolean(refundedItems.length) &&
                    refundedItems.map((lineItem: ITransactionLineItem) => (
                        <TransactionLineItem {...lineItem} status={'completed'} key={`${lineItem.id}-refunded`} />
                    ))}
                {failedItems &&
                    Boolean(failedItems.length) &&
                    failedItems.map((lineItem: ITransactionLineItem) => (
                        <TransactionLineItem {...lineItem} status={'failed'} key={`${lineItem.id}-failed`} />
                    ))}
                {inProgressItems &&
                    Boolean(inProgressItems.length) &&
                    inProgressItems.map((lineItem: ITransactionLineItem) => (
                        <TransactionLineItem {...lineItem} status={'in_progress'} key={`${lineItem.id}-in-progress`} />
                    ))}
            </div>
        );
    }, [view, i18n, availableItems, refundedItems, failedItems, inProgressItems]);
};

export default TransactionLineItems;
