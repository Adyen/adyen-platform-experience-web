import { FunctionalComponent } from 'preact';
import { useCallback, useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import { GRANT_DETAILS_CLASS_NAMES } from './constants';
import { GrantDetailsProps } from './types';
import './GrantDetails.scss';
import { ExpandableContainer } from '../../../../internal/ExpandableContainer/ExpandableContainer';
import StructuredList from '../../../../internal/StructuredList';
import { StructuredListItem } from '../../../../internal/StructuredList/types';

export const GrantDetails: FunctionalComponent<GrantDetailsProps> = ({ grant }) => {
    const { i18n } = useCoreContext();
    const formatAmount = useCallback((amount: { value: number; currency: string }) => i18n.amount(amount.value, amount.currency), [i18n]);
    const structuredListItems = useMemo<StructuredListItem[]>(() => {
        const maximumRepaymentPeriodMonths = Math.ceil(grant.maximumRepaymentPeriodDays / 30);
        return [
            {
                key: 'capital.remainingAmount',
                value: i18n.amount(grant.remainingGrantAmount.value, grant.remainingGrantAmount.currency),
            },
            { key: 'capital.remainingFee', value: formatAmount(grant.remainingFeesAmount) },
            { key: 'capital.repaidAmount', value: formatAmount(grant.repaidGrantAmount) },
            { key: 'capital.repaidFees', value: formatAmount(grant.repaidFeesAmount) },
            { key: 'capital.repaymentRate', value: i18n.get('capital.percentDaily', { values: { percent: grant.repaymentRate } }) },
            {
                key: 'capital.expectedRepaymentPeriod',
                value: i18n.get('capital.daysAndDaysLeft', {
                    values: {
                        days: grant.expectedRepaymentPeriodDays,
                        daysLeft: grant.repaymentPeriodLeft,
                    },
                }),
            },
            {
                key: 'capital.maximumRepaymentPeriod',
                value: `${maximumRepaymentPeriodMonths} ${i18n.get('capital.months')}`,
            },
            { key: 'capital.totalFees', value: formatAmount(grant.feesAmount) },
            { key: 'capital.totalRepaymentAmount', value: formatAmount(grant.totalAmount) },
            { key: 'capital.repaymentThreshold', value: formatAmount(grant.thresholdAmount) },
            { key: 'capital.loadId', value: grant.id },
            { key: 'capital.balanceDescription', value: grant.balanceAccountDescription },
            { key: 'capital.balanceAccount', value: grant.balanceAccountCode },
        ];
    }, [grant, formatAmount, i18n]);

    return (
        <ExpandableContainer className={GRANT_DETAILS_CLASS_NAMES.base}>
            <div className={GRANT_DETAILS_CLASS_NAMES.content}>
                <div className={GRANT_DETAILS_CLASS_NAMES.header}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.SUBTITLE}>
                        {i18n.get('capital.yourInitialOfferWas')}
                    </Typography>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.SUBTITLE} strongest>
                        {i18n.amount(grant.grantAmount.value, grant.grantAmount.currency)}
                    </Typography>
                </div>
                <StructuredList
                    renderLabel={val => (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className={GRANT_DETAILS_CLASS_NAMES.label}>
                            {val}
                        </Typography>
                    )}
                    renderValue={val => (
                        <Typography el={TypographyElement.SPAN} stronger variant={TypographyVariant.CAPTION}>
                            {val}
                        </Typography>
                    )}
                    items={structuredListItems}
                />
            </div>
        </ExpandableContainer>
    );
};
