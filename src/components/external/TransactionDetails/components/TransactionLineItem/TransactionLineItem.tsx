import classNames from 'classnames';
import { useEffect } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { TranslationKey } from '../../../../../translations';
import { ITransactionLineItem } from '../../../../../types';
import { components } from '../../../../../types/api/resources/TransactionsResource';
import Accordion from '../../../../internal/Accordion/Accordion';
import StructuredList from '../../../../internal/StructuredList';
import './TransactionListItem.scss';
import TransactionLineItemTitle from './TransactionLineItemTitle';

const DISABLED_STATUSES: Array<components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available'> = [
    'in_progress',
    'completed',
    'failed',
];

const getDetailDataFields = (isTruncated: boolean) => [...(isTruncated ? ['description'] : []), 'currency', 'sku', 'id'];

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
    const [isTruncated, setIsTruncated] = useState(false);

    const detailData = useMemo(() => {
        const additionalDataWithCurrency = { ...additionalData, currency: amountIncludingTax.currency, description };

        return getDetailDataFields(isTruncated)
            .filter(key => Object.keys(additionalDataWithCurrency).includes(key))
            .map(
                key =>
                    ({ key: key, value: additionalDataWithCurrency[key as keyof typeof additionalDataWithCurrency] } as {
                        key: TranslationKey;
                        value: string;
                    })
            );
    }, [additionalData, amountIncludingTax.currency, isTruncated]);

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
                    <TransactionLineItemTitle
                        {...{
                            chevron: chevron,
                            amountIncludingTax,
                            description,
                            availableQuantity,
                            status,
                            showCheckbox,
                            handleSelection,
                            isLineItem,
                            setTitleTruncated: setIsTruncated,
                            ...additionalData,
                        }}
                    />
                }
            >
                <StructuredList layout="3-9" items={detailData} />
            </Accordion>
        </div>
    );
};

export default TransactionLineItem;
