import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { TranslationKey } from '../../../../translations';
import { ITransactionLineItem } from '../../../../types';
import { components } from '../../../../types/api/resources/TransactionsResource';
import Accordion from '../../../internal/Accordion/Accordion';
import StructuredList from '../../../internal/StructuredList';
import './TransactionListItem.scss';

import TransactionRefundItemSelect from './TransactionRefundItemSelect';

const DISABLED_STATUSES: Array<components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available'> = ['in_progress', 'completed'];
//
const detailDataFields = ['currency', 'id', 'sku'];
const TransactionLineItem = ({
    amountIncludingTax,
    description,
    availableQuantity,
    status,
    showCheckbox,
    handleSelection,
    isLineItem = false,
    ...additionalData
}: ITransactionLineItem & { status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available' } & {
    showCheckbox?: boolean;
    isLineItem: boolean;
    handleSelection?: (e: any) => any;
}) => {
    const [chevron, setChevron] = useState<JSXInternal.Element | null>(null);

    const detailData = useMemo(() => {
        const additionalDataWithCurrency = { ...additionalData, currency: amountIncludingTax.currency };

        return detailDataFields
            .filter(key => Object.keys(additionalDataWithCurrency).includes(key))
            .map(
                key =>
                    ({ key: key, value: additionalDataWithCurrency[key as keyof typeof additionalDataWithCurrency] } as {
                        key: TranslationKey;
                        value: string;
                    })
            );
    }, [additionalData, amountIncludingTax.currency]);

    const onChevronChange = useCallback(
        (e: any) => {
            setChevron(e);
        },
        [setChevron]
    );

    return (
        <div
            key={`${additionalData.id}-${status}`}
            className={classNames(`adyen-pe-transaction-line-item-container`, {
                'adyen-pe-transaction-line-item--disabled': DISABLED_STATUSES.includes(status),
            })}
        >
            <Accordion
                renderChevron={onChevronChange}
                header={
                    <TransactionRefundItemSelect
                        {...{
                            chevron: chevron,
                            amountIncludingTax,
                            description,
                            availableQuantity,
                            status,
                            showCheckbox,
                            handleSelection,
                            isLineItem,
                            ...additionalData,
                        }}
                    />
                }
            >
                <StructuredList layout={'3-9'} items={detailData} />
            </Accordion>
        </div>
    );
};

export default TransactionLineItem;
