import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { ILineItem, ITransactionLineItem } from '../../../../types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import { TX_DATA_CONTAINER } from '../constants';
import { ActiveView } from '../context/types';
import useLineItemData from '../context/useLineItemData';
import TransactionLineItem from './TransactionLineItem';

const TransactionLineItems = ({ view }: { view: ActiveView }) => {
    const { i18n } = useCoreContext();
    const { hasSelectAll, totalAmount, totalQuantity, statusesByCurrentView, lineItemsByStatus, handleSelectAll } = useLineItemData(view);

    return useMemo(() => {
        return (
            <div className={`${TX_DATA_CONTAINER}`}>
                <Typography variant={TypographyVariant.BODY}>{i18n.get('orderItem')}</Typography>
                {Boolean(hasSelectAll) && (
                    <TransactionLineItem
                        id={'refund-all'}
                        availableQuantity={totalQuantity}
                        originalQuantity={totalQuantity}
                        amountIncludingTax={totalAmount}
                        description={i18n.get('refundAllItems')}
                        handleSelection={handleSelectAll}
                        isLineItem={false}
                        status={'available'}
                        showCheckbox={view === ActiveView.REFUND}
                        key={`refund-all-item-${view}`}
                    />
                )}
                {statusesByCurrentView?.map(key => {
                    const items = lineItemsByStatus[key];
                    return items && items?.length > 0
                        ? items.map((item: ILineItem) => (
                              <TransactionLineItem
                                  {...item}
                                  isLineItem={true}
                                  status={key}
                                  showCheckbox={view === ActiveView.REFUND}
                                  key={`${item.id}-${key}`}
                              />
                          ))
                        : null;
                })}
            </div>
        );
    }, [view, i18n, statusesByCurrentView, lineItemsByStatus, handleSelectAll]);
};

export default TransactionLineItems;
