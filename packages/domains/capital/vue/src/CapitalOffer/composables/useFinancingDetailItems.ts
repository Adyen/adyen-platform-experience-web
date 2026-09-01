import { CAPITAL_REPAYMENT_FREQUENCY, calculatePercentageFromBasisPoints, FinancingDetails } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import { useFormatTermLabel } from './useFormatTermLabel';
import { useFormatMaxRepaymentDate } from './useFormatMaxRepaymentDate';

export type FinancingDetailItemKey =
    | 'financing'
    | 'fees'
    | 'totalRepaymentAmount'
    | 'dailyRepaymentRate'
    | 'annualPercentageRate'
    | 'repaymentThreshold'
    | 'expectedRepaymentPeriod'
    | 'maximumRepaymentDate'
    | 'account';

export type FinancingDetailItem = {
    key: FinancingDetailItemKey;
    label: string;
    value: string;
    info?: string;
};

export function useFinancingDetailItems() {
    const { i18n } = useCoreContext();
    const formatTermLabel = useFormatTermLabel();
    const formatMaxRepaymentDate = useFormatMaxRepaymentDate();

    const getItem = (financingDetails: FinancingDetails, key: FinancingDetailItemKey): FinancingDetailItem | undefined => {
        switch (key) {
            case 'financing':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.financing'),
                    value: i18n.amount(financingDetails.grantAmount.value, financingDetails.grantAmount.currency),
                };
            case 'fees':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.fees'),
                    value: i18n.amount(financingDetails.feesAmount.value, financingDetails.feesAmount.currency),
                };
            case 'totalRepaymentAmount':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.totalRepaymentAmount'),
                    value: i18n.amount(financingDetails.totalAmount.value, financingDetails.totalAmount.currency),
                };
            case 'dailyRepaymentRate':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.dailyRepaymentRate'),
                    value: i18n.get('capital.common.values.percentage', {
                        values: { percentage: calculatePercentageFromBasisPoints(financingDetails.repaymentRate) },
                    }),
                };
            case 'annualPercentageRate':
                return financingDetails.aprBasisPoints
                    ? {
                          key: key,
                          label: i18n.get('capital.common.fields.annualPercentageRate'),
                          value: i18n.get('capital.common.values.percentage', {
                              values: { percentage: calculatePercentageFromBasisPoints(financingDetails.aprBasisPoints) },
                          }),
                          info: i18n.get('capital.common.fields.annualPercentageRate.description'),
                      }
                    : undefined;
            case 'repaymentThreshold':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.repaymentThreshold'),
                    value: i18n.amount(financingDetails.thresholdAmount.value, financingDetails.thresholdAmount.currency),
                    info: i18n.get('capital.common.fields.repaymentThreshold.description', {
                        values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                    }),
                };
            case 'expectedRepaymentPeriod':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.expectedRepaymentPeriod'),
                    value: formatTermLabel(financingDetails.expectedRepaymentPeriodDays),
                };
            case 'maximumRepaymentDate':
                return financingDetails.maximumRepaymentPeriodDays
                    ? {
                          key: key,
                          label: i18n.get('capital.common.fields.maximumRepaymentDate'),
                          value: formatMaxRepaymentDate(financingDetails.maximumRepaymentPeriodDays),
                      }
                    : undefined;
            case 'account':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.account'),
                    value: i18n.get('capital.common.values.primaryAccount'),
                };
        }
    };

    const getItems = (financingDetails: FinancingDetails, keys: FinancingDetailItemKey[]): FinancingDetailItem[] => {
        return keys.map(key => getItem(financingDetails, key)).filter((item): item is FinancingDetailItem => Boolean(item));
    };

    return { getItems };
}
