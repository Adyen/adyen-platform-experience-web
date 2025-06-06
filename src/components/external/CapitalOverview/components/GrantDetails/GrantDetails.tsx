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
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { CAPITAL_REPAYMENT_FREQUENCY } from '../../../../constants';

export const GrantDetails: FunctionalComponent<GrantDetailsProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const formatAmount = useCallback((amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency), [i18n]);
    const structuredListItems = useMemo<StructuredListItem[]>(() => {
        const maximumRepaymentPeriodMonths = grant.maximumRepaymentPeriodDays ? Math.ceil(grant.maximumRepaymentPeriodDays / 30) : null;
        const items: StructuredListItem[] = [
            {
                key: 'capital.remainingAmount',
                value: i18n.amount(grant.remainingGrantAmount.value, grant.remainingGrantAmount.currency),
            },
            { key: 'capital.remainingFees', value: formatAmount(grant.remainingFeesAmount) },
            { key: 'capital.repaidAmount', value: formatAmount(grant.repaidGrantAmount) },
            { key: 'capital.repaidFees', value: formatAmount(grant.repaidFeesAmount) },
            {
                key: 'capital.dailyRepaymentRate',
                value: `${i18n.get('capital.xPercent', {
                    values: { percentage: getPercentage(grant.repaymentRate) },
                })}`,
            },
            {
                key: 'capital.expectedRepaymentPeriod',
                value: i18n.get('capital.daysAndDaysLeft', {
                    values: {
                        days: grant.expectedRepaymentPeriodDays,
                        daysLeft: grant.repaymentPeriodLeft,
                    },
                }),
            },
            { key: 'capital.totalFees', value: formatAmount(grant.feesAmount) },
            { key: 'capital.totalRepaymentAmount', value: formatAmount(grant.totalAmount) },
            { key: 'capital.repaymentThreshold', value: formatAmount(grant.thresholdAmount) },
            { key: 'capital.grantID', value: grant.id },
            { key: 'accountDescription', value: grant.balanceAccountDescription },
            { key: 'accountID', value: grant.balanceAccountCode },
        ];

        if (maximumRepaymentPeriodMonths) {
            items.splice(5, 0, {
                key: 'capital.maximumRepaymentPeriod',
                value: i18n.get('capital.xMonths', { values: { months: maximumRepaymentPeriodMonths } }),
            });
        }

        return items;
    }, [grant, formatAmount, i18n]);

    return (
        <div className={GRANT_DETAILS_CLASS_NAMES.base}>
            <div className={GRANT_DETAILS_CLASS_NAMES.content}>
                <div className={GRANT_DETAILS_CLASS_NAMES.header}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                        {i18n.get('capital.yourRequestedFundsWere')}
                    </Typography>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} strongest>
                        {i18n.amount(grant.grantAmount.value, grant.grantAmount.currency)}
                    </Typography>
                </div>
                <StructuredList
                    renderLabel={(val, key) =>
                        key === 'capital.repaymentThreshold' ? (
                            <Tooltip
                                isContainerHovered
                                content={i18n.get('capital.minimumRepaymentToRepayTheFinancingOnTime', {
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
