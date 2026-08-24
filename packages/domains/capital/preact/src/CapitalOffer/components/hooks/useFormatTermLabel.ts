import { useCallback } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import { calculateMonthsAndDaysFromDays } from '@integration-components/capital/domain';

export const useFormatTermLabel = () => {
    const { i18n } = useCoreContext();

    return useCallback(
        (days: number): string => {
            const { months, remainingDays } = calculateMonthsAndDaysFromDays(days);
            const monthsPart =
                months === 1 ? i18n.get('capital.common.values.oneMonth') : i18n.get('capital.common.values.numberOfMonths', { values: { months } });

            const remainingDaysPart =
                remainingDays === 0
                    ? undefined
                    : remainingDays === 1
                      ? i18n.get('capital.common.values.oneDay')
                      : i18n.get('capital.common.values.numberOfDays', { values: { days: remainingDays } });

            return [monthsPart, remainingDaysPart].filter(Boolean).join(', ');
        },
        [i18n]
    );
};
