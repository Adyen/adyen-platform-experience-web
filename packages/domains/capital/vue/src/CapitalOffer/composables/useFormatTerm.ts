import { MaybeRefOrGetter, toValue } from 'vue';
import { calculateMonthsAndDaysFromDays, type ContractTypeKeyMap } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import type { IContractType } from '@integration-components/types';
import { useContractCopy } from '../../shared/composables/useContractCopy';

const CONTRACT_KEYS = {
    months: {
        CashAdvance: 'capital.common.cashAdvance.expectedRepaymentPeriodMonths',
        Loan: 'capital.common.numberOfMonths',
    },
    oneMonth: {
        CashAdvance: 'capital.common.cashAdvance.expectedRepaymentPeriodOneMonth',
        Loan: 'capital.common.oneMonth',
    },
} satisfies ContractTypeKeyMap;

export const useFormatTerm = (contractType: MaybeRefOrGetter<IContractType>, hasAsterisk?: boolean) => {
    const { i18n } = useCoreContext();
    const { getContractCopy } = useContractCopy(contractType);

    return (days: number): string => {
        const { months, remainingDays } = calculateMonthsAndDaysFromDays(days);
        const monthsPart =
            months === 0
                ? undefined
                : months === 1
                  ? getContractCopy(CONTRACT_KEYS.oneMonth)
                  : getContractCopy(CONTRACT_KEYS.months, { values: { months } });
        const daysPart =
            remainingDays === 0
                ? undefined
                : remainingDays === 1
                  ? i18n.get('capital.common.oneDay')
                  : i18n.get('capital.common.numberOfDays', { values: { days: remainingDays } });

        const base = [monthsPart, daysPart].filter(Boolean).join(', ');
        const suffix = toValue(contractType) === 'CashAdvance' && hasAsterisk ? '*' : '';
        return `${base}${suffix}`;
    };
};
