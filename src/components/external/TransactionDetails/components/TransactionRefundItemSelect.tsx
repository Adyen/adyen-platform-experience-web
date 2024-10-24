import { useEffect } from 'preact/compat';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import useCoreContext from '../../../../core/Context/useCoreContext';
import { ITransactionLineItem } from '../../../../types';
import { components } from '../../../../types/api/resources/TransactionsResource';
import Icon from '../../../internal/Icon';
import { Tag } from '../../../internal/Tag/Tag';
import { TagVariant } from '../../../internal/Tag/types';
import { TypographyVariant } from '../../../internal/Typography/types';
import Typography from '../../../internal/Typography/Typography';
import { useTransactionRefundContext } from '../context/refund';

const TransactionRefundItemSelect = ({
    amountIncludingTax,
    description,
    availableQuantity,
    status,
    chevron,
    classNames,
    showCheckbox,
    handleSelection,
    isLineItem = false,
    ...additionalData
}: ITransactionLineItem & { status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available' } & {
    showCheckbox?: boolean;
    isLineItem: boolean;
    handleSelection?: (e: any) => any;
    classNames?: string;
    chevron?: JSXInternal.Element | null;
}) => {
    const { i18n } = useCoreContext();
    const [checked, setChecked] = useState(false);
    const { updateItems, clearItems } = useTransactionRefundContext();
    const { items } = useTransactionRefundContext();

    const getTagByStatus = (status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available') => {
        switch (status) {
            case 'completed':
                return <Tag label={i18n.get('refunded')} variant={TagVariant.WHITE}></Tag>;
            case 'in_progress':
                return <Tag label={i18n.get('refundInProgress')} variant={TagVariant.BLUE}></Tag>;
            case 'failed':
                return <Tag label={i18n.get('refundFailed')} variant={TagVariant.WARNING}></Tag>;
        }
    };

    useEffect(() => {
        if (isLineItem) {
            const shouldChecked = items.find(item => item.id === additionalData.id);
            setChecked(!!shouldChecked);
        }
    }, [items]);

    const onClick = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            if (handleSelection) {
                handleSelection(checked);
            }
            if (isLineItem) {
                if (!checked) {
                    updateItems([{ id: additionalData.id, amount: amountIncludingTax.value, quantity: availableQuantity }]);
                } else {
                    clearItems([additionalData.id]);
                }
            }
            setChecked(!checked);
        },
        [checked, additionalData.id, availableQuantity, amountIncludingTax, updateItems, clearItems]
    );

    return (
        <div className={'adyen-pe-transaction-line-item'}>
            {status !== 'available' && <div>{getTagByStatus(status)}</div>}
            <div style={{ display: 'flex', width: '100%', gap: '6px' }}>
                <div className={'adyen-pe-transaction-line-item-heading--description'}>
                    {
                        <div style={{ display: status === 'available' && showCheckbox ? 'block' : 'none', zIndex: 10 }}>
                            <Icon
                                role="checkbox"
                                aria-checked={checked}
                                tabindex="0"
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
                        <Tag attribute-label={availableQuantity} label={`${availableQuantity}`} />
                    </Typography>
                    <Typography variant={TypographyVariant.BODY} stronger>
                        {i18n.amount(amountIncludingTax.value, amountIncludingTax.currency)}
                    </Typography>
                </div>
                {chevron && chevron}
            </div>
        </div>
    );
};

export default TransactionRefundItemSelect;
