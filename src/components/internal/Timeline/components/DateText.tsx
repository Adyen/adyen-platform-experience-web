import { useMemo } from 'preact/hooks';
import { TimelineDateFormat, TimelineDateUnit } from '../types';
import useTimezoneAwareDateFormatting from '../../../../hooks/useTimezoneAwareDateFormatting';

interface DateTextProps {
    date: Date;
    format?: TimelineDateFormat;
    timezone?: string;
}

function getDateFormatOptions(format?: TimelineDateFormat): Intl.DateTimeFormatOptions {
    switch (format) {
        case TimelineDateFormat.FULL_DATE:
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            };
        case TimelineDateFormat.FULL_DATE_EXACT_TIME:
        case TimelineDateFormat.FULL_DATE_EXACT_TIME_WITHOUT_PERIOD:
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            };
        case TimelineDateFormat.FULL_DATE_EXACT_TIME_WITHOUT_SECONDS:
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
        case TimelineDateFormat.SHORT_DATE:
            return {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            };
        case TimelineDateFormat.SHORT_DATE_TIME:
            return {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false,
            };
        default:
            return {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
            };
    }
}

export function DateText({ date, format, timezone }: DateTextProps) {
    const { dateFormat } = useTimezoneAwareDateFormatting(timezone);

    const formattedDate = useMemo(() => {
        const options = getDateFormatOptions(format);

        return dateFormat(date, options);
    }, [date, dateFormat, format]);

    return <>{formattedDate}</>;
}

export function formatDistanceStrict(
    dateLeft: Date,
    dateRight: Date,
    options: { unit: TimelineDateUnit }
): { value: number; unit: TimelineDateUnit } {
    const leftTime = dateLeft.getTime();
    const rightTime = dateRight.getTime();
    const diffMs = Math.abs(leftTime - rightTime);

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    let value: number;
    let unit: TimelineDateUnit;

    // TODO - Add more supported units
    switch (options.unit) {
        case 'day':
            value = diffMs / day;
            unit = 'day';
            break;
        default:
            value = diffMs / day;
            unit = 'day';
    }

    value = Math.round(value);

    return { value, unit };
}
