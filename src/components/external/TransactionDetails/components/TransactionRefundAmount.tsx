import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_HEAD,
} from '../constants';
import { h } from 'preact';
import { useCallback, useState } from 'preact/hooks';
import useTransactionDataContext from '../context';
import useCoreContext from '../../../../core/Context/useCoreContext';
import InputBase from '../../../internal/FormFields/InputBase';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { TagVariant } from '../../../internal/Tag/types';
import { Tag } from '../../../internal/Tag/Tag';

const TransactionRefundAmount = () => {
    const { i18n } = useCoreContext();
    const { transaction, refundValue, refundValueMax, updateRefundValue } = useTransactionDataContext();
    const [refundAmount, setRefundAmount] = useState(refundValue);

    const withinRange = refundAmount > 0 || refundAmount <= refundValueMax;

    const onInput = useCallback(
        (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const amount = parseFloat(evt.currentTarget.value);
            if (amount > 0) {
                setRefundAmount(amount);
                if (amount <= refundValueMax) updateRefundValue(amount);
            }
        },
        [setRefundAmount, updateRefundValue]
    );

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {`${i18n.get('refundAmount')}`}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_SHORT} ${TX_DATA_INPUT_CONTAINER_TEXT}`}>
                <label htmlFor="refundAmount">
                    <Tag label={transaction.amount.currency} variant={TagVariant.DEFAULT} />
                    <InputBase
                        className={TX_DATA_INPUT}
                        lang={i18n.locale}
                        type="number"
                        value={refundAmount}
                        onInput={onInput}
                        min={0}
                        isInvalid={!withinRange}
                        errorMessage={i18n.get('noNegativeNumbersAllowed')}
                        uniqueId={'refundAmount'}
                    />
                </label>
            </div>
        </div>
    );
};

export default TransactionRefundAmount;
