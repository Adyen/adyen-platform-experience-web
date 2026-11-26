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

type FormatTermOptions = {
    hasAsterisk?: boolean;
    hasEstPrefix?: boolean;
};

export const useFormatTerm = (
    contractType: MaybeRefOrGetter<IContractType>,
    { hasAsterisk = false, hasEstPrefix = false }: FormatTermOptions = {}
) => {
    const { i18n } = useCoreContext();
    const { getContractCopy } = useContractCopy(contractType);

    const getMonthsPart = (months: number) => {
        if (months === 0) return undefined;
        if (months === 1) {
            return hasEstPrefix ? getContractCopy(CONTRACT_KEYS.oneMonth) : i18n.get('capital.common.oneMonth');
        }
        return hasEstPrefix
            ? getContractCopy(CONTRACT_KEYS.months, { values: { months } })
            : i18n.get('capital.common.numberOfMonths', { values: { months } });
    };

    const getDaysPart = (days: number) => {
        if (days === 0) return undefined;
        if (days === 1) {
            return i18n.get('capital.common.oneDay');
        }
        return i18n.get('capital.common.numberOfDays', { values: { days } });
    };

    return (days: number): string => {
        const { months, remainingDays } = calculateMonthsAndDaysFromDays(days);
        const monthsPart = getMonthsPart(months);
        const daysPart = getDaysPart(remainingDays);
        const parts = [monthsPart, daysPart].filter((part): part is string => !!part);
        const base = new Intl.ListFormat(i18n.locale, { type: 'unit', style: 'short' }).format(parts);
        const suffix = toValue(contractType) === 'CashAdvance' && hasAsterisk ? '*' : '';
        return `${base}${suffix}`;
    };
};
