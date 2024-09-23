import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_CONTAINER_WITH_ERROR,
    TX_DATA_INPUT_HEAD,
} from '../constants';
import cx from 'classnames';
import { h } from 'preact';
import { useCallback, useRef, useState } from 'preact/hooks';
import useTransactionDataContext from '../context';
import useCoreContext from '../../../../core/Context/useCoreContext';
import CloseCircle from '../../../internal/SVGIcons/CloseCircle';
import InputBase from '../../../internal/FormFields/InputBase';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { TranslationKey } from '../../../../translations';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { TagVariant } from '../../../internal/Tag/types';
import { Tag } from '../../../internal/Tag/Tag';
import { uniqueId } from '../../../../utils';

const TransactionRefundAmount = () => {
    const { i18n } = useCoreContext();
    const { transaction, refundValue, refundValueMax, updateRefundValue } = useTransactionDataContext();
    const [refundAmount, setRefundAmount] = useState(refundValue);

    const inputIdentifier = useRef(uniqueId());
    const labelIdentifier = useRef(uniqueId());

    const onInput = useCallback(
        (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const amount = parseFloat(evt.currentTarget.value);
            setRefundAmount(amount);
            updateRefundValue(amount);
        },
        [setRefundAmount, updateRefundValue]
    );

    let errorMessage: TranslationKey | null = null;

    if (refundAmount < 0) errorMessage = 'noNegativeNumbersAllowed';
    else if (refundAmount > refundValueMax) errorMessage = 'refundAmount.excess';

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <div id={labelIdentifier.current}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('refundAmount')}
                    </Typography>
                </div>
            </div>

            <div
                className={cx({
                    [TX_DATA_INPUT_CONTAINER]: true,
                    [TX_DATA_INPUT_CONTAINER_SHORT]: true,
                    [TX_DATA_INPUT_CONTAINER_TEXT]: true,
                    [TX_DATA_INPUT_CONTAINER_WITH_ERROR]: !!errorMessage,
                })}
            >
                <label htmlFor={inputIdentifier.current} aria-labelledby={labelIdentifier.current}>
                    <Tag label={transaction.amount.currency} variant={TagVariant.DEFAULT} />
                    <InputBase
                        min={0}
                        type="number"
                        className={TX_DATA_INPUT}
                        lang={i18n.locale}
                        onInput={onInput}
                        value={refundAmount}
                        uniqueId={inputIdentifier.current}
                    />
                </label>
                {errorMessage && (
                    <div className="adyen-pe-input__invalid-value" id={`${inputIdentifier.current}${ARIA_ERROR_SUFFIX}`}>
                        <CloseCircle />
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                            {i18n.get(errorMessage)}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransactionRefundAmount;
