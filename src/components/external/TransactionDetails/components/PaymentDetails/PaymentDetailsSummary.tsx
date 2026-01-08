import { memo } from 'preact/compat';
import { IAmount } from '../../../../../types';
import { isNullish } from '../../../../../utils';
import { useCallback, useMemo } from 'preact/hooks';
import { TransactionDetails } from '../../types';
import { TranslationKey } from '../../../../../translations';
import { TX_DATA_LABEL, TX_DATA_LIST } from '../../constants';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { getTransactionAmountAdjustmentType } from '../../../../utils/translation/getters';
import { StructuredListProps } from '../../../../internal/StructuredList/types';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import StructuredList from '../../../../internal/StructuredList';
import cx from 'classnames';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';

const paymentAmountKeys = {
    grossAmount: 'transactions.details.summary.fields.grossAmount',
    netAmount: 'transactions.details.summary.fields.netAmount',
    originalAmount: 'transactions.details.summary.fields.originalAmount',
} satisfies Record<string, TranslationKey>;

const SKIP_ITEM: StructuredListProps['items'][number] = null!;

export interface PaymentDetailsSummaryProps {
    transaction: TransactionDetails;
}

const isAmount = (value: any): value is IAmount => {
    return value && typeof value === 'object' && 'value' in value;
};

const ADJUSTMENTS_TOOLTIP_CONTENT: Record<`transactions.details.summary.adjustments.types.${string}`, TranslationKey> = {
    'transactions.details.summary.adjustments.types.tip': 'transactions.details.summary.adjustments.types.tip.information',
    'transactions.details.summary.adjustments.types.surcharge': 'transactions.details.summary.adjustments.types.surcharge.information',
};

const PaymentDetailsSummary = ({ transaction }: PaymentDetailsSummaryProps) => {
    const { i18n } = useCoreContext();

    const summaryListItems = useMemo<StructuredListProps['items']>(() => {
        const { additions, deductions, amountBeforeDeductions, netAmount, originalAmount } = transaction;

        const getFormattedAmount = (amount?: IAmount) => {
            if (isNullish(amount)) return null;
            const { value, currency } = amount;
            return i18n.amount(value, currency);
        };

        const listItems: StructuredListProps['items'] = [
            // original amount
            originalAmount && ((additions && additions.length > 0) || originalAmount.value !== amountBeforeDeductions.value)
                ? {
                      id: 'originalAmount',
                      key: paymentAmountKeys.originalAmount,
                      value: getFormattedAmount(originalAmount),
                  }
                : SKIP_ITEM,

            // additions
            ...(additions?.map(({ type, ...amount }) => ({
                key: getTransactionAmountAdjustmentType(i18n, type) as TranslationKey,
                value: getFormattedAmount(amount),
            })) ?? []),

            // amountBeforeDeductions
            {
                id: 'grossAmount',
                key: paymentAmountKeys.grossAmount,
                value: getFormattedAmount(amountBeforeDeductions),
            },

            // deductions
            ...(deductions?.map(({ type, ...amount }) => ({
                key: `transactions.details.summary.adjustments.types.${type}` as TranslationKey,
                value: getFormattedAmount(amount),
                rawValue: amount,
                label: getTransactionAmountAdjustmentType(i18n, type),
            })) ?? []),

            // netAmount
            {
                id: 'netAmount',
                key: paymentAmountKeys.netAmount,
                value: getFormattedAmount(netAmount),
            },
        ];

        return listItems.filter(Boolean);
    }, [i18n, transaction]);

    const renderListPropertyLabel = useCallback<NonNullable<StructuredListProps['renderLabel']>>(
        (label, key, value) => {
            const tooltipContent = ADJUSTMENTS_TOOLTIP_CONTENT[key as keyof typeof ADJUSTMENTS_TOOLTIP_CONTENT];

            if (value && isAmount(value) && value.value < 0 && tooltipContent) {
                return (
                    <Tooltip content={i18n.get(tooltipContent)} key={key} isUnderlineVisible>
                        <span className={cx(TX_DATA_LABEL)}>{label}</span>
                    </Tooltip>
                );
            }
            return <div className={cx(TX_DATA_LABEL)}>{label}</div>;
        },
        [i18n]
    );

    const renderListPropertyValue = useCallback<NonNullable<StructuredListProps['renderValue']>>((val, key) => {
        const strongest = key === paymentAmountKeys.netAmount;
        const variant = TypographyVariant.BODY;
        return (
            <Typography el={TypographyElement.DIV} variant={variant} strongest={strongest}>
                {val}
            </Typography>
        );
    }, []);

    return (
        <StructuredList
            classNames={TX_DATA_LIST}
            items={summaryListItems}
            layout="5-7"
            renderLabel={renderListPropertyLabel}
            renderValue={renderListPropertyValue}
        />
    );
};

export default memo(PaymentDetailsSummary);
