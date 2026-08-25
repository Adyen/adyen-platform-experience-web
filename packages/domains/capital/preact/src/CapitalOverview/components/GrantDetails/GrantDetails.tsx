import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import { CAPITAL_REPAYMENT_FREQUENCY, calculatePercentageFromBasisPoints, getEnhancedGrant } from '@integration-components/capital/domain';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import { GRANT_DETAILS_CLASS_NAMES } from './constants';
import { GrantDetailsProps } from './types';
import './GrantDetails.scss';
import StructuredList from '@integration-components/ui-components-preact/StructuredList';
import { StructuredListItem } from '@integration-components/ui-components-preact/StructuredList/types';
import { Translation } from '@integration-components/ui-components-preact/Translation';
import { Tooltip } from '@integration-components/ui-components-preact/Tooltip/Tooltip';

export const GrantDetails: FunctionalComponent<GrantDetailsProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const formatAmount = useCallback((amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency), [i18n]);
    const structuredListItems = useMemo<StructuredListItem[]>(() => {
        const enhancedGrant = getEnhancedGrant(grant);
        const items: StructuredListItem[] = [
            {
                key: 'capital.common.fields.remainingAmount',
                value: i18n.amount(enhancedGrant.remainingGrantAmount.value, enhancedGrant.remainingGrantAmount.currency),
            },
            { key: 'capital.common.fields.remainingFees', value: formatAmount(enhancedGrant.remainingFeesAmount) },
            { key: 'capital.common.fields.repaidAmount', value: formatAmount(enhancedGrant.repaidGrantAmount) },
            { key: 'capital.common.fields.repaidFees', value: formatAmount(enhancedGrant.repaidFeesAmount) },
            {
                key: 'capital.common.fields.dailyRepaymentRate',
                value: `${i18n.get('capital.common.values.percentage', {
                    values: { percentage: calculatePercentageFromBasisPoints(enhancedGrant.repaymentRate) },
                })}`,
            },
            {
                key: 'capital.common.fields.expectedRepaymentPeriod',
                value: i18n.get('capital.common.values.daysWithDaysLeft', {
                    values: {
                        days: enhancedGrant.expectedRepaymentPeriodDays,
                        daysLeft: enhancedGrant.repaymentPeriodLeft,
                    },
                }),
            },
            { key: 'capital.common.fields.totalFees', value: formatAmount(enhancedGrant.feesAmount) },
            { key: 'capital.common.fields.totalRepaymentAmount', value: formatAmount(enhancedGrant.totalAmount) },
            { key: 'capital.common.fields.repaymentThreshold', value: formatAmount(enhancedGrant.thresholdAmount) },
            { key: 'capital.common.fields.grantID', value: enhancedGrant.id },
            { key: 'capital.common.fields.accountDescription', value: enhancedGrant.balanceAccountDescription },
            { key: 'capital.common.fields.accountID', value: enhancedGrant.balanceAccountCode },
        ];

        if (enhancedGrant.maximumRepaymentPeriodMonths) {
            items.splice(5, 0, {
                key: 'capital.common.fields.maximumRepaymentPeriod',
                value: i18n.get('capital.common.values.numberOfMonths', { values: { months: enhancedGrant.maximumRepaymentPeriodMonths } }),
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
                                isUnderlineVisible
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
