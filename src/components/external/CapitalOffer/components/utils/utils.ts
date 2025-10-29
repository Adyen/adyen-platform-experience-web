import { DAY_MS } from '../../../../internal/Calendar/calendar/constants';
import { parseDate } from '../../../../../utils';

const dateStartUTCTimestampOffset = (date: Date | number | string, numberOfDays = 0) => {
    return new Date(new Date(date).setUTCHours(0, 0, 0, 0) + Math.floor(numberOfDays) * DAY_MS);
};

export const getExpectedRepaymentDate = (expectedRepaymentPeriodDays: number) => {
    return parseDate(dateStartUTCTimestampOffset(new Date(), expectedRepaymentPeriodDays));
};

export const calculateMaximumRepaymentPeriodInMonths = (days?: number) => (days ? Math.ceil(days / 30) : null);

interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): void;
    cancel: () => void;
}

export const debounce = <T extends (...args: any[]) => any>(func: T, delay: number): DebouncedFunction<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let lastArgs: Parameters<T> | undefined;

    function debounced(...args: Parameters<T>): void {
        clearTimeout(timeoutId);
        lastArgs = args;

        timeoutId = setTimeout(() => {
            if (lastArgs) {
                func(...lastArgs);
            }
            lastArgs = undefined;
        }, delay);
    }

    debounced.cancel = () => {
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
            lastArgs = undefined;
        }
    };

    return debounced;
};

export const getPercentage = (rate: number) => {
    return rate / 100;
};
