import { useEffect, useState } from 'preact/hooks';
import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_HEAD,
} from '../../constants';
import useTransactionDataContext from '../../context';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import InputBase from '../../../../internal/FormFields/InputBase';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { TagVariant } from '../../../../internal/Tag/types';
import { Tag } from '../../../../internal/Tag/Tag';

const TransactionRefundAmount = () => {
    const { i18n } = useCoreContext();
    const { transaction, refundValue, refundValueMax, updateRefundValue } = useTransactionDataContext();
    const [refundAmount, setRefundAmount] = useState(refundValue);

    const withinRange = refundAmount > 0 || refundAmount <= refundValueMax;

    useEffect(() => {
        setRefundAmount(refundValue);
    }, [refundValue]);

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
                        lang={i18n.locale}
                        type="number"
                        value={refundAmount}
                        // onKeyUp={() => withinRange && updateRefundValue(refundAmount)}
                        onInput={evt => {
                            const amount = parseFloat(evt.currentTarget.value);
                            amount > 0 && setRefundAmount(amount);
                        }}
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
