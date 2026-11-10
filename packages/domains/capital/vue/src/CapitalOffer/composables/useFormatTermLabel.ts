import { calculateMonthsAndDaysFromDays } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';
import { useCapitalCopy } from '../../shared/composables/useCapitalCopy';
import { IContractType } from '@integration-components/types';

export const useFormatTermLabel = () => {
    const { i18n } = useCoreContext();
    const { getContractCopy } = useCapitalCopy();

    const getMonthsPart = (months: number, contractType?: IContractType) => {
        if (months <= 0) return undefined;

        if (months === 1) {
            return getContractCopy('capital.common.values.expectedRepaymentPeriodOneMonth', contractType ?? 'loan');
        }

        return getContractCopy('capital.common.values.expectedRepaymentPeriodMonths', contractType, { values: { months } });
    };

    const getDaysPart = (remainingDays: number) => {
        if (remainingDays <= 0) return undefined;

        if (remainingDays === 1) {
            return i18n.get('capital.common.values.oneDay');
        }

        return i18n.get('capital.common.values.numberOfDays', { values: { days: remainingDays } });
    };

    return (days: number, contractType?: IContractType): string => {
        const { months, remainingDays } = calculateMonthsAndDaysFromDays(days);
        const monthsPart = getMonthsPart(months, contractType);
        const daysPart = getDaysPart(remainingDays);

        return [monthsPart, daysPart].filter(Boolean).join(', ');
    };
};
