import { useCallback, useMemo } from 'preact/hooks';
import { TX_DATA_CONTAINER, TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_SHORT, TX_DATA_INPUT_HEAD } from '../constants';
import { REFUND_REASONS, REFUND_REASONS_KEYS } from '../../context/constants';
import type { RefundReason } from '../../context/types';
import useTransactionRefundContext from '../../context/refund';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Select from '../../../../internal/FormFields/Select';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { SelectProps } from '../../../../internal/FormFields/Select/types';
import useUniqueId from '../../../../../hooks/useUniqueId';

const TransactionRefundReason = () => {
    const { i18n } = useCoreContext();
    const { interactionsDisabled, refundReason, setRefundReason } = useTransactionRefundContext();
    const labelId = `refund-reason-${useUniqueId()}`;

    const refundReasons = useMemo(
        () =>
            Object.freeze(
                REFUND_REASONS.map(reason => ({
                    id: reason,
                    name: i18n.has(REFUND_REASONS_KEYS[reason]) ? i18n.get(REFUND_REASONS_KEYS[reason]) : reason,
                }))
            ),
        [i18n]
    );

    const onReasonChanged = useCallback<SelectProps<{ id: RefundReason; name: string }>['onChange']>(
        evt => {
            const reason = evt.target?.value;
            reason && setRefundReason(reason);
        },
        [setRefundReason]
    );

    return (
        <div className={TX_DATA_CONTAINER}>
            <div id={labelId} className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {i18n.get('transactions.details.refund.inputs.reason.label')}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_SHORT}`}>
                <Select
                    items={refundReasons}
                    readonly={interactionsDisabled}
                    filterable={false}
                    multiSelect={false}
                    onChange={onReasonChanged}
                    selected={refundReason}
                    aria-labelledby={labelId}
                />
            </div>
        </div>
    );
};

export default TransactionRefundReason;
