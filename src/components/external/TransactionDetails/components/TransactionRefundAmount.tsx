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
import { boolOrFalse, uniqueId } from '../../../../utils';
import useCoreContext from '../../../../core/Context/useCoreContext';
import useTransactionRefundContext from '../context/refund';
import CloseCircle from '../../../internal/SVGIcons/CloseCircle';
import InputBase from '../../../internal/FormFields/InputBase';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { TranslationKey } from '../../../../translations';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { TagVariant } from '../../../internal/Tag/types';
import { Tag } from '../../../internal/Tag/Tag';

const _BaseRefundAmountInput = ({
    currency,
    disabled,
    errorMessage,
    onInput,
    value,
}: {
    currency: string;
    disabled?: boolean;
    errorMessage: TranslationKey | null;
    onInput?: (evt: h.JSX.TargetedEvent<HTMLInputElement>) => unknown;
    value: number;
}) => {
    const { i18n } = useCoreContext();
    const inputIdentifier = useRef(uniqueId());
    const labelIdentifier = useRef(uniqueId());

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
                    {currency && <Tag label={currency} variant={TagVariant.DEFAULT} />}
                    <InputBase
                        min={0}
                        type="number"
                        className={TX_DATA_INPUT}
                        disabled={boolOrFalse(disabled)}
                        lang={i18n.locale}
                        onInput={onInput}
                        value={value}
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

export const TransactionRefundFullAmountInput = () => {
    const { amount, currency } = useTransactionRefundContext();
    return <_BaseRefundAmountInput currency={currency} errorMessage={null} value={amount} disabled />;
};

export const TransactionRefundPartialAmountInput = () => {
    const { amount, availableAmount, currency, setAmount } = useTransactionRefundContext();
    const [refundAmount, setRefundAmount] = useState(amount);

    const onInput = useCallback(
        (evt: h.JSX.TargetedEvent<HTMLInputElement>) => {
            const amount = parseFloat(evt.currentTarget.value);
            setRefundAmount(amount);
            setAmount(amount);
        },
        [setRefundAmount, setAmount]
    );

    let errorMessage: TranslationKey | null = null;

    if (refundAmount < 0) {
        errorMessage = 'noNegativeNumbersAllowed';
    } else if (refundAmount > availableAmount) {
        errorMessage = 'refundAmount.excess';
    }

    return <_BaseRefundAmountInput currency={currency} errorMessage={errorMessage} onInput={onInput} value={refundAmount} />;
};
