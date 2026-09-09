import { calculateTimestampAfterDays } from '@integration-components/capital/domain';
import { useTimezoneAwareDateFormatting } from '@integration-components/composables-vue';
import { DATE_FORMAT_CAPITAL_OVERVIEW } from '@integration-components/utils';

export const useFormatMaxRepaymentDate = () => {
    const { dateFormat } = useTimezoneAwareDateFormatting();

    return (maxRepaymentDays: number): string => {
        const maxRepaymentTimestamp = calculateTimestampAfterDays(maxRepaymentDays);
        return dateFormat(maxRepaymentTimestamp, DATE_FORMAT_CAPITAL_OVERVIEW);
    };
};
