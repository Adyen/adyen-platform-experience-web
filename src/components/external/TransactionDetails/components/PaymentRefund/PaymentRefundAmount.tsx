import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_SHORT,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_CONTAINER_WITH_ERROR,
    TX_DATA_INPUT_HEAD,
} from '../../constants';
import cx from 'classnames';
import { memo } from 'preact/compat';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { ARIA_ERROR_SUFFIX } from '../../../../../core/Errors/constants';
import { getDecimalAmount, getDivider } from '../../../../../core/Localization/amount/amount-util';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import InputBase from '../../../../internal/FormFields/InputBase';
import useUniqueId from '../../../../../hooks/useUniqueId';
import Icon from '../../../../internal/Icon';

interface PaymentRefundAmountProps {
    currency: string;
    disabled?: boolean;
    onChange?: (value: number) => void;
    value: string | number;
}

const PaymentRefundAmount = memo(({ currency, disabled, onChange, value }: PaymentRefundAmountProps) => {
    const { i18n } = useCoreContext();
    const inputIdentifier = useUniqueId();
    const labelIdentifier = useUniqueId();

    const currencyExponent = Math.log10(getDivider(currency));
    const refundableAmount = parseInt(`${value}`, 10);
    const formattedAmount = getDecimalAmount(refundableAmount, currency).toFixed(currencyExponent);

    const [refundAmount, setRefundAmount] = useState<string | number>(formattedAmount);
    const [validationError, setValidationError] = useState<keyof typeof errorMessages>();

    const errorMessages = useMemo(() => {
        const values = { amount: i18n.amount(refundableAmount, currency) };
        return {
            excess: i18n.get('transactions.details.refund.inputs.amount.errors.excess', { values }),
            negative: i18n.get('transactions.details.refund.inputs.amount.errors.negative'),
            required: i18n.get('transactions.details.refund.inputs.amount.errors.required'),
        } as const;
    }, [i18n, currency, refundableAmount]);

    const errorMessage = validationError && errorMessages[validationError];
    const inputLabel = useMemo(() => i18n.get('transactions.details.refund.inputs.amount.label'), [i18n]);
    const inputElementRef = useRef<HTMLInputElement>(null);

    const onInput = useCallback(
        (target: HTMLInputElement) => {
            let error: typeof validationError;
            let value = target.value.trim();
            const amount = Math.trunc(+`${parseFloat(value)}e${currencyExponent}`) || 0;

            if (amount || value) {
                if (amount < 0) error = 'negative';
                if (amount > refundableAmount) error = 'excess';
            } else error = 'required';

            // Get the decimal separator based on the user's locale
            const decimalSeparator = (1.1).toLocaleString(i18n.locale).match(/\d(.*?)\d/)?.[1] || '.';

            // Split the input value at the decimal separator
            const parts = value.split(decimalSeparator);

            if (parts.length === 2) {
                const integerPart = parts[0]!;
                let decimalPart = parts[1]!;

                if (decimalPart.length >= currencyExponent) {
                    decimalPart = decimalPart.substring(0, currencyExponent);
                    value = integerPart + decimalSeparator + decimalPart;
                    target.value = value;
                }
            }

            setRefundAmount(value);
            setValidationError(error);
            onChange?.(error ? 0 : amount);
        },
        [currencyExponent, refundableAmount, onChange]
    );

    const cachedRefundableAmount = useRef<number>();

    useEffect(() => {
        if (cachedRefundableAmount.current !== refundableAmount) {
            cachedRefundableAmount.current = refundableAmount;
        } else if (disabled && validationError && inputElementRef.current) {
            inputElementRef.current.value = formattedAmount;
        } else return;

        if (inputElementRef.current) {
            onInput(inputElementRef.current);
        }
    }, [onInput, disabled, formattedAmount, refundableAmount]);

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <div id={labelIdentifier}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {inputLabel}
                    </Typography>
                </div>
            </div>

            <div
                className={cx({
                    [TX_DATA_INPUT_CONTAINER]: true,
                    [TX_DATA_INPUT_CONTAINER_SHORT]: true,
                    [TX_DATA_INPUT_CONTAINER_TEXT]: true,
                    [TX_DATA_INPUT_CONTAINER_WITH_ERROR]: errorMessage,
                })}
            >
                <label htmlFor={inputIdentifier} aria-labelledby={labelIdentifier}>
                    {currency && <Tag label={currency} variant={TagVariant.DEFAULT} />}
                    <InputBase
                        min={0}
                        type="number"
                        className={TX_DATA_INPUT}
                        disabled={disabled}
                        lang={i18n.locale}
                        onInput={evt => onInput(evt.currentTarget)}
                        value={refundAmount}
                        uniqueId={inputIdentifier}
                        ref={inputElementRef}
                    />
                </label>
                {errorMessage && (
                    <div className="adyen-pe-input__refund-invalid-value" id={`${inputIdentifier}${ARIA_ERROR_SUFFIX}`}>
                        <Icon name="cross-circle-fill" />
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                            {errorMessage}
                        </Typography>
                    </div>
                )}
            </div>
        </div>
    );
});

export default PaymentRefundAmount;
