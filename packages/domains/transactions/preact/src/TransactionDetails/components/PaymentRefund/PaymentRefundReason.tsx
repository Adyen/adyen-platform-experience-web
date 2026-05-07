import { REFUND_REASONS, TX_DATA_CONTAINER, TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_SHORT, TX_DATA_INPUT_HEAD } from '../../constants';
import { RefundReason } from '../../types';
import { useCallback, useMemo } from 'preact/hooks';
import { getTransactionRefundReason } from '@integration-components/transactions/domain';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-primitives-preact/Typography/types';
import { useCoreContext } from '@integration-components/core/preact';
import Typography from '@integration-components/ui-primitives-preact/Typography/Typography';
import Select from '@integration-components/ui-primitives-preact/FormFields/Select';
import { useUniqueId } from '@integration-components/hooks-preact';

export interface PaymentRefundReasonProps {
    disabled: boolean;
    onChange: (reason: RefundReason) => void;
    reason: RefundReason;
}

const PaymentRefundReason = ({ disabled, onChange, reason }: PaymentRefundReasonProps) => {
    const { i18n } = useCoreContext();
    const selectLabelId = useUniqueId();
    const selectLabel = useMemo(() => i18n.get('transactions.details.refund.inputs.reason.label'), [i18n]);

    const refundReasons = useMemo(
        () =>
            REFUND_REASONS.map(reason => ({
                name: getTransactionRefundReason(i18n, reason) as string,
                id: reason,
            })),
        [i18n]
    );

    const onReasonChange = useCallback(
        (evt: { target?: { value: RefundReason } }) => {
            const reason = evt.target?.value;
            if (reason) {
                onChange(reason);
            }
        },
        [onChange]
    );

    return (
        <div className={TX_DATA_CONTAINER}>
            <div id={selectLabelId} className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {selectLabel}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_SHORT}`}>
                <Select
                    aria-labelledby={selectLabelId}
                    filterable={false}
                    multiSelect={false}
                    readonly={disabled}
                    items={refundReasons}
                    onChange={onReasonChange}
                    selected={reason}
                />
            </div>
        </div>
    );
};

export default PaymentRefundReason;
