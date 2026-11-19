import {
    CAPITAL_REPAYMENT_FREQUENCY,
    calculatePercentageFromBasisPoints,
    SHARED_CONTRACT_KEYS,
    type ContractTypeKeyMap,
    type FinancingDetails,
} from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IContractType } from '@integration-components/types';
import { useContractCopy } from '../../shared/composables/useContractCopy';
import { useFormatTerm } from './useFormatTerm';
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

type FinancingDetailItemWithOptionalLabel = Omit<FinancingDetailItem, 'label'> & { label: string | undefined };

const CONTRACT_KEYS = {
    annualPercentageRate: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.annualPercentageRate.label',
    },
    annualPercentageRateDescription: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.annualPercentageRate.description',
    },
    maximumRepaymentDate: {
        CashAdvance: undefined,
        Loan: 'capital.common.fields.loan.maximumRepaymentDate.label',
    },
} satisfies ContractTypeKeyMap;

export function useFinancingDetailItems(getContractType: () => IContractType) {
    const { i18n } = useCoreContext();
    const { getContractCopy } = useContractCopy(getContractType);
    const formatTermLabel = useFormatTerm(getContractType);
    const formatMaxRepaymentDate = useFormatMaxRepaymentDate();

    const getItem = (financingDetails: FinancingDetails, key: FinancingDetailItemKey): FinancingDetailItemWithOptionalLabel | undefined => {
        switch (key) {
            case 'financing':
                return {
                    key,
                    label: getContractCopy(SHARED_CONTRACT_KEYS.financing),
                    value: i18n.amount(financingDetails.grantAmount.value, financingDetails.grantAmount.currency),
                };
            case 'fees':
                return {
                    key,
                    label: i18n.get('capital.common.fields.fees.label'),
                    value: i18n.amount(financingDetails.feesAmount.value, financingDetails.feesAmount.currency),
                };
            case 'totalRepaymentAmount':
                return {
                    key,
                    label: getContractCopy(SHARED_CONTRACT_KEYS.totalRepaymentAmount),
                    value: i18n.amount(financingDetails.totalAmount.value, financingDetails.totalAmount.currency),
                };
            case 'dailyRepaymentRate':
                return {
                    key,
                    label: getContractCopy(SHARED_CONTRACT_KEYS.dailyRepaymentRate),
                    value: i18n.get('capital.common.percentageOfDailySales', {
                        values: { percentage: calculatePercentageFromBasisPoints(financingDetails.repaymentRate) },
                    }),
                };
            case 'annualPercentageRate':
                return financingDetails.aprBasisPoints !== undefined
                    ? {
                          key,
                          label: getContractCopy(CONTRACT_KEYS.annualPercentageRate),
                          value: i18n.get('capital.common.percentage', {
                              values: { percentage: calculatePercentageFromBasisPoints(financingDetails.aprBasisPoints) },
                          }),
                          info: getContractCopy(CONTRACT_KEYS.annualPercentageRateDescription),
                      }
                    : undefined;
            case 'repaymentThreshold':
                return {
                    key,
                    label: getContractCopy(SHARED_CONTRACT_KEYS.repaymentThreshold),
                    value: i18n.amount(financingDetails.thresholdAmount.value, financingDetails.thresholdAmount.currency),
                    info: getContractCopy(SHARED_CONTRACT_KEYS.repaymentThresholdDescription, {
                        values: { days: CAPITAL_REPAYMENT_FREQUENCY },
                    }),
                };
            case 'expectedRepaymentPeriod':
                return {
                    key,
                    label: getContractCopy(SHARED_CONTRACT_KEYS.expectedRepaymentPeriod),
                    value: formatTermLabel(financingDetails.expectedRepaymentPeriodDays),
                };
            case 'maximumRepaymentDate':
                return financingDetails.maximumRepaymentPeriodDays
                    ? {
                          key,
                          label: getContractCopy(CONTRACT_KEYS.maximumRepaymentDate),
                          value: formatMaxRepaymentDate(financingDetails.maximumRepaymentPeriodDays),
                      }
                    : undefined;
            case 'account':
                return {
                    key,
                    label: i18n.get('capital.common.fields.account.label'),
                    value: i18n.get('capital.common.values.primaryAccount'),
                };
        }
    };

    const getItems = (financingDetails: FinancingDetails, keys: FinancingDetailItemKey[]): FinancingDetailItem[] => {
        return keys.map(key => getItem(financingDetails, key)).filter((item): item is FinancingDetailItem => item?.label !== undefined);
    };

    return { getItems };
}
