import { useState } from 'preact/hooks';
import { TX_DATA_CONTAINER } from '../../constants';
import useTransactionDataContext from '../../context';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import InputBase from '../../../../internal/FormFields/InputBase';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';

const TransactionRefundAmount = () => {
    const { i18n } = useCoreContext();
    const { refundValue, refundValueMax, updateRefundValue } = useTransactionDataContext();
    const [refundAmount, setRefundAmount] = useState(refundValue);

    const withinRange = refundAmount > 0 || refundAmount <= refundValueMax;

    return (
        <div className={TX_DATA_CONTAINER}>
            <div>
                <label htmlFor="refundAmount">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {`${i18n.get('refundAmount')}`}
                    </Typography>
                </label>
                <InputBase
                    lang={i18n.locale}
                    name={'refundAmount'}
                    type="number"
                    value={refundAmount}
                    onBlur={() => withinRange && updateRefundValue(refundAmount)}
                    onInput={evt => {
                        const amount = parseFloat(evt.currentTarget.value);
                        amount > 0 && setRefundAmount(amount);
                    }}
                    min={0}
                    isInvalid={!withinRange}
                    errorMessage={i18n.get('noNegativeNumbersAllowed')}
                />
            </div>
        </div>
    );
};

export default TransactionRefundAmount;
