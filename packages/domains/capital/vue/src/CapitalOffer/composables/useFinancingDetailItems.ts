import { CAPITAL_REPAYMENT_FREQUENCY, calculatePercentageFromBasisPoints, FinancingDetails } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';
import { useFormatTermLabel } from './useFormatTermLabel';
import { useFormatMaxRepaymentDate } from './useFormatMaxRepaymentDate';
import { IContractType } from '@integration-components/types';

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

export function useFinancingDetailItems(contractType?: IContractType) {
    const { i18n } = useCoreContext();
    const { getContractCopy } = useCapitalCopy();
    const formatTermLabel = useFormatTermLabel();
    const formatMaxRepaymentDate = useFormatMaxRepaymentDate();

    const getItem = (financingDetails: FinancingDetails, key: FinancingDetailItemKey): FinancingDetailItem | undefined => {
        switch (key) {
            case 'financing':
                return {
                    key: key,
                    label: getContractCopy('capital.common.fields.financing', contractType),
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
                    label: getContractCopy('capital.common.fields.totalRepaymentAmount', contractType),
                    value: i18n.amount(financingDetails.totalAmount.value, financingDetails.totalAmount.currency),
                };
            case 'dailyRepaymentRate':
                return {
                    key: key,
                    label: getContractCopy('capital.common.fields.dailyRepaymentRate', contractType),
                    value: i18n.get('capital.common.values.percentageOfDailySales', {
                        values: { percentage: calculatePercentageFromBasisPoints(financingDetails.repaymentRate) },
                    }),
                };
            case 'annualPercentageRate':
                return financingDetails.aprBasisPoints !== undefined
                    ? {
                          key: key,
                          label: i18n.get('capital.common.fields.annualPercentageRate'),
                          value: i18n.get('capital.common.values.percentage', {
                              values: { percentage: calculatePercentageFromBasisPoints(financingDetails.aprBasisPoints) },
                          }),
                          info: i18n.get('capital.common.fields.annualPercentageRateDescription'),
                      }
                    : undefined;
            case 'repaymentThreshold':
                return {
                    key: key,
                    label: i18n.get('capital.common.fields.repaymentThreshold.loan'),
                    value: i18n.amount(financingDetails.thresholdAmount.value, financingDetails.thresholdAmount.currency),
                    info: i18n.get('capital.common.fields.repaymentThresholdDescription.loan', {
                        values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                    }),
                };
            case 'expectedRepaymentPeriod':
                return {
                    key: key,
                    label: getContractCopy('capital.common.fields.expectedRepaymentPeriod', contractType),
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
