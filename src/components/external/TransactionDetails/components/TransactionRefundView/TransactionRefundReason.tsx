import { useCallback, useMemo } from 'preact/hooks';
import { TX_DATA_CONTAINER, TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_SHORT, TX_DATA_INPUT_HEAD } from '../../constants';
import { useTransactionDataContext, REFUND_REASONS, RefundReason } from '../../context';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Select from '../../../../internal/FormFields/Select';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { SelectProps } from '../../../../internal/FormFields/Select/types';

const TransactionRefundReason = () => {
    const { i18n } = useCoreContext();
    const { refundReason, updateRefundReason } = useTransactionDataContext();
    const refundReasons = useMemo(() => Object.freeze(REFUND_REASONS.map(reason => ({ id: reason, name: i18n.get(reason) }))), [i18n]);

    const onReasonChanged = useCallback<SelectProps<{ id: RefundReason; name: string }>['onChange']>(
        evt => {
            const reason = evt.target?.value;
            reason && updateRefundReason(reason);
        },
        [updateRefundReason]
    );

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {`${i18n.get('refundReason')}`}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_SHORT}`}>
                <Select items={refundReasons} filterable={false} multiSelect={false} onChange={onReasonChanged} selected={refundReason} />
            </div>
        </div>
    );
};

export default TransactionRefundReason;
