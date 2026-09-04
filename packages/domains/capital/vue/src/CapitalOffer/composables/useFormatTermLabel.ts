import { calculateMonthsAndDaysFromDays } from '@integration-components/capital/domain';
import { useCoreContext } from '@integration-components/core/vue';

export const useFormatTermLabel = () => {
    const { i18n } = useCoreContext();

    return (days: number): string => {
        const { months, remainingDays } = calculateMonthsAndDaysFromDays(days);
        const monthsPart =
            months === 0
                ? undefined
                : months === 1
                  ? i18n.get('capital.common.values.oneMonth')
                  : i18n.get('capital.common.values.numberOfMonths', { values: { months } });
        const daysPart =
            remainingDays === 0
                ? undefined
                : remainingDays === 1
                  ? i18n.get('capital.common.values.oneDay')
                  : i18n.get('capital.common.values.numberOfDays', { values: { days: remainingDays } });

        return [monthsPart, daysPart].filter(Boolean).join(', ');
    };
};
