import cx from 'classnames';
import { useEffect, useRef } from 'preact/compat';
import { MutableRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ITransactionLineItem } from '../../../../../types';
import { components } from '../../../../../types/api/resources/TransactionsResource';
// import Icon from '../../../internal/Icon';
import { Tag } from '../../../../internal/Tag/Tag';
// import { TagVariant } from '../../../internal/Tag/types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import {
    TX_LINE_ITEM_TITLE_CLASS,
    TX_LINE_ITEM_TITLE_CONTAINER_CLASS,
    TX_LINE_ITEM_TITLE_DESCRIPTION_CLASS,
    TX_LINE_ITEM_TITLE_DETAIL_CLASS,
} from './constants';
// import { useTransactionRefundContext } from '../../context/refund';

const TransactionLineItemTitle = ({
    amountIncludingTax,
    description,
    availableQuantity,
    status,
    chevron,
    classNames,
    showCheckbox,
    handleSelection,
    isLineItem = false,
    setTitleTruncated,
    ...additionalData
}: Omit<ITransactionLineItem, 'refundStatuses'> & { status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available' } & {
    showCheckbox?: boolean;
    isLineItem: boolean;
    handleSelection?: (e: any) => any;
    classNames?: string;
    setTitleTruncated?: any;
    chevron?: JSXInternal.Element | null;
}) => {
    const { i18n } = useCoreContext();
    // const [checked, setChecked] = useState(false);
    // const { updateItems, clearItems } = useTransactionRefundContext();
    const descriptionRef = useRef<HTMLElement>();
    // const { items, availableItems } = useTransactionRefundContext();

    // TODO: Delete or uncomment when line items will be researched
    // const getTagByStatus = (status: components['schemas']['TransactionLineItemRefundStatus']['status'] | 'available') => {
    //     switch (status) {
    //         case 'completed':
    //             return <Tag label={i18n.get('refunded')} variant={TagVariant.WHITE}></Tag>;
    //         case 'in_progress':
    //             return <Tag label={i18n.get('refundInProgress')} variant={TagVariant.BLUE}></Tag>;
    //         case 'failed':
    //             return <Tag label={i18n.get('refundFailed')} variant={TagVariant.WARNING}></Tag>;
    //     }
    // };

    // useEffect(() => {
    //     if (isLineItem) {
    //         const shouldChecked = items.find(item => item.reference === additionalData.reference);
    //         setChecked(!!shouldChecked);
    //     } else {
    //         if (items.length === availableItems.length && !checked) setChecked(true);
    //         if (checked && items.length !== availableItems.length) setChecked(false);
    //     }
    // }, [items, availableItems]);

    // TODO: Delete or uncomment when line items will be researched
    // const onClick = useCallback(
    //     (e: MouseEvent) => {
    //         e.stopPropagation();
    //         if (handleSelection) {
    //             handleSelection(checked);
    //         }
    //         if (isLineItem) {
    //             if (!checked) {
    //                 updateItems([{ reference: additionalData.reference, amount: amountIncludingTax.value, quantity: availableQuantity }]);
    //             } else {
    //                 clearItems([additionalData.reference]);
    //             }
    //         }
    //         setChecked(!checked);
    //     },
    //     [checked, additionalData.id, availableQuantity, amountIncludingTax, updateItems, clearItems]
    // );

    useEffect(() => {
        if (descriptionRef?.current && descriptionRef?.current?.scrollHeight > descriptionRef?.current?.offsetHeight) {
            setTitleTruncated(true);
        } else {
            setTitleTruncated(false);
        }
    }, []);

    return (
        <div className={cx(TX_LINE_ITEM_TITLE_CLASS, classNames)}>
            {/*{status !== 'available' && <div>{getTagByStatus(status)}</div>}*/}
            <div className={TX_LINE_ITEM_TITLE_CONTAINER_CLASS}>
                <div className={TX_LINE_ITEM_TITLE_DESCRIPTION_CLASS}>
                    {/*{status === 'available' && showCheckbox && (*/}
                    {/*    <div style={{ zIndex: 10 }}>*/}
                    {/*        <Icon*/}
                    {/*            role="checkbox"*/}
                    {/*            aria-checked={checked}*/}
                    {/*            tabindex="0"*/}
                    {/*            name={checked ? 'checkmark-square-fill' : 'square'}*/}
                    {/*            style={{ width: 16, height: 16 }}*/}
                    {/*            onClick={onClick}*/}
                    {/*        />*/}
                    {/*    </div>*/}
                    {/*)}*/}
                    <Typography variant={TypographyVariant.BODY} stronger ref={descriptionRef}>
                        {description}
                    </Typography>
                </div>
                <div className={TX_LINE_ITEM_TITLE_DETAIL_CLASS}>
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

export default TransactionLineItemTitle;
