import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { GRANT_DETAILS_CLASS_NAMES } from './constants';
import { GrantDetailsProps } from './types';
import './GrantDetails.scss';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListItem } from '../../../../internal/StructuredList/types';
import { getPercentage } from '../../../CapitalOffer/components/utils/utils';
import { Translation } from '../../../../internal/Translation';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { CAPITAL_REPAYMENT_FREQUENCY } from '../../../../constants';

export const GrantDetails: FunctionalComponent<GrantDetailsProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const formatAmount = useCallback((amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency), [i18n]);
    const structuredListItems = useMemo<StructuredListItem[]>(() => {
        const maximumRepaymentPeriodMonths = grant.maximumRepaymentPeriodDays ? Math.ceil(grant.maximumRepaymentPeriodDays / 30) : null;
        const items: StructuredListItem[] = [
            {
                key: 'capital.common.fields.remainingAmount',
                value: i18n.amount(grant.remainingGrantAmount.value, grant.remainingGrantAmount.currency),
            },
            { key: 'capital.common.fields.remainingFees', value: formatAmount(grant.remainingFeesAmount) },
            { key: 'capital.common.fields.repaidAmount', value: formatAmount(grant.repaidGrantAmount) },
            { key: 'capital.common.fields.repaidFees', value: formatAmount(grant.repaidFeesAmount) },
            {
                key: 'capital.common.fields.dailyRepaymentRate',
                value: `${i18n.get('capital.common.values.percentage', {
                    values: { percentage: getPercentage(grant.repaymentRate) },
                })}`,
            },
            {
                key: 'capital.common.fields.expectedRepaymentPeriod',
                value: i18n.get('capital.common.values.daysWithDaysLeft', {
                    values: {
                        days: grant.expectedRepaymentPeriodDays,
                        daysLeft: grant.repaymentPeriodLeft,
                    },
                }),
            },
            { key: 'capital.common.fields.totalFees', value: formatAmount(grant.feesAmount) },
            { key: 'capital.common.fields.totalRepaymentAmount', value: formatAmount(grant.totalAmount) },
            { key: 'capital.common.fields.repaymentThreshold', value: formatAmount(grant.thresholdAmount) },
            { key: 'capital.common.fields.grantID', value: grant.id },
            { key: 'capital.common.fields.accountDescription', value: grant.balanceAccountDescription },
            { key: 'capital.common.fields.accountID', value: grant.balanceAccountCode },
        ];

        if (maximumRepaymentPeriodMonths) {
            items.splice(5, 0, {
                key: 'capital.common.fields.maximumRepaymentPeriod',
                value: i18n.get('capital.common.values.numberOfMonths', { values: { months: maximumRepaymentPeriodMonths } }),
            });
        }

        return items;
    }, [grant, formatAmount, i18n]);

    return (
        <div className={GRANT_DETAILS_CLASS_NAMES.base}>
            <div className={GRANT_DETAILS_CLASS_NAMES.content}>
                <div className={GRANT_DETAILS_CLASS_NAMES.header}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        <Typography el={TypographyElement.PARAGRAPH} variant={TypographyVariant.BODY}>
                            <Translation
                                translationKey="capital.overview.grants.item.details.requestedFunds"
                                fills={{
                                    amount: (
                                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} strongest>
                                            {i18n.amount(grant.grantAmount.value, grant.grantAmount.currency)}
                                        </Typography>
                                    ),
                                }}
                            />
                        </Typography>
                    </Typography>
                </div>
                <StructuredList
                    renderLabel={(val, key) =>
                        key === 'capital.common.fields.repaymentThreshold' ? (
                            <Tooltip
                                showUnderline
                                content={i18n.get('capital.common.fields.repaymentThreshold.description', {
                                    values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                                })}
                            >
                                <span>
                                    <Typography
                                        className={GRANT_DETAILS_CLASS_NAMES.label}
                                        el={TypographyElement.SPAN}
                                        variant={TypographyVariant.CAPTION}
                                    >
                                        {val}
                                    </Typography>
                                </span>
                            </Tooltip>
                        ) : (
                            <Typography className={GRANT_DETAILS_CLASS_NAMES.label} el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION}>
                                {val}
                            </Typography>
                        )
                    }
                    renderValue={val => (
                        <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                            {val}
                        </Typography>
                    )}
                    items={structuredListItems}
                />
            </div>
        </div>
    );
};
