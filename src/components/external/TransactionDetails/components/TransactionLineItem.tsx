import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { TranslationKey } from '../../../../translations';
import { ITransactionLineItem } from '../../../../types';
import { components } from '../../../../types/api/resources/TransactionsResource';
import Accordion from '../../../internal/Accordion/Accordion';
import Icon from '../../../internal/Icon';
import StructuredList from '../../../internal/StructuredList';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import './TransactionListItem.scss';
import { useTransactionRefundContext } from '../context/refund';

const DISABLED_STATUSES: Array<components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available'> = [
    'failed',
    'in_progress',
    'completed',
];

const detailDataFields = ['currency', 'id', 'sku'];
const TransactionLineItem = ({
    amountIncludingTax,
    description,
    availableQuantity,
    status,
    showCheckbox,
    ...additionalData
}: ITransactionLineItem & { status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available' } & {
    showCheckbox?: boolean;
}) => {
    const { i18n } = useCoreContext();
    const [checked, setChecked] = useState(false);
    const { updateItems, clearItems } = useTransactionRefundContext();

    const getTagByStatus = (status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available') => {
        switch (status) {
            case 'completed':
                return <Tag label={i18n.get('refunded')} variant={TagVariant.DEFAULT}></Tag>;
            case 'in_progress':
                return <Tag label={i18n.get('refundInProgress')} variant={TagVariant.SUCCESS}></Tag>;
            case 'failed':
                return <Tag label={i18n.get('refundFailed')} variant={TagVariant.ERROR}></Tag>;
        }
    };

    console.log('line item');
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

    const onClick = useCallback(() => {
        if (!checked) {
            updateItems([{ id: additionalData.id, amount: amountIncludingTax.value, quantity: availableQuantity }]);
        } else {
            clearItems([additionalData.id]);
        }
        setChecked(!checked);
    }, [checked, additionalData.id, availableQuantity, amountIncludingTax, updateItems, clearItems]);

    return (
        <div
            key={`${additionalData.id}-${status}`}
            className={classNames('adyen-pe-transaction-line-item', {
                'adyen-pe-transaction-line-item--disabled': DISABLED_STATUSES.includes(status),
            })}
        >
            <Accordion
                header={
                    <>
                        <div style={{ display: 'flex', width: '100%', alignItems: 'flex-start', flexDirection: 'column', justifyContent: 'center' }}>
                            {status !== 'available' && <div>{getTagByStatus(status)}</div>}
                            <div style={{ display: 'flex', width: '100%' }}>
                                <div className={'adyen-pe-transaction-line-item-heading--description'}>
                                    {
                                        <div style={{ display: status === 'available' && showCheckbox ? 'block' : 'none' }}>
                                            <Icon
                                                name={checked ? 'checkmark-square-fill' : 'square'}
                                                style={{ width: 16, height: 16 }}
                                                onClick={onClick}
                                            />
                                        </div>
                                    }
                                    <Typography variant={TypographyVariant.BODY} stronger>
                                        {description}
                                    </Typography>
                                </div>
                                <div className={'adyen-pe-transaction-line-item-heading--additional-info'}>
                                    <Typography variant={TypographyVariant.CAPTION} stronger>
                                        <Tag attribute-label={availableQuantity} label={availableQuantity.toString()} />
                                    </Typography>
                                    <Typography variant={TypographyVariant.BODY} stronger>
                                        {i18n.amount(amountIncludingTax.value, amountIncludingTax.currency)}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </>
                }
            >
                <StructuredList layout={'3-9'} items={detailData} />
            </Accordion>
        </div>
    );
};

export default TransactionLineItem;
