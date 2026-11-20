import type { CdnFetcher } from '@integration-components/core';
import localArrivalTimes from '../../config/arrivalTimes.json';

/**
 * How long a cashOut usually takes to arrive, per currency, with the duration for the others. Durations are ISO 8601 durations
 * of days, hours, minutes and seconds, such as `PT5M`, `PT2H`, `P1D` or `PT30S`.
 */
export type CashOutArrivalTimes = {
    defaultDuration?: string;
    durationByCurrency?: Partial<Record<string, string>>;
};

/** How the arrival time is told: in less than a minute, or within a whole number of minutes, hours or days. */
export type CashOutArrivalTime =
    | { key: 'cashOut.common.arrivalTime.lessThanAMinute' }
    | {
          key: 'cashOut.common.arrivalTime.withinMinutes' | 'cashOut.common.arrivalTime.withinHours' | 'cashOut.common.arrivalTime.withinDays';
          count: number;
      };

/** The duration when the arrival times give none that can be used. */
export const DEFAULT_ARRIVAL_DURATION = 'PT30M';

export const LOCAL_ARRIVAL_TIMES: CashOutArrivalTimes = localArrivalTimes;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 60 * SECONDS_PER_MINUTE;
const SECONDS_PER_DAY = 24 * SECONDS_PER_HOUR;
const DURATION_PATTERN = /^P(?:(?<days>\d+)D)?(?:T(?=\d)(?:(?<hours>\d+)H)?(?:(?<minutes>\d+)M)?(?:(?<seconds>\d+)S)?)?$/;

// The arrival times can change without a release, so they come from the CDN; the bundled ones apply until it answers, or when it fails.
export const getArrivalTimes = async (getCdnConfig?: CdnFetcher): Promise<CashOutArrivalTimes> => {
    const arrivalTimes = await getCdnConfig?.<CashOutArrivalTimes>({ subFolder: 'cashOut', name: 'arrivalTimes', fallback: localArrivalTimes });
    return arrivalTimes ?? LOCAL_ARRIVAL_TIMES;
};

// The CDN file is edited by hand, so only a valid duration longer than 0 is used.
const toSeconds = (duration: unknown): number | undefined => {
    const parts = typeof duration === 'string' && duration !== 'P' ? DURATION_PATTERN.exec(duration)?.groups : undefined;
    if (!parts) return undefined;
    const { days = '0', hours = '0', minutes = '0', seconds = '0' } = parts;
    const total = Number(days) * SECONDS_PER_DAY + Number(hours) * SECONDS_PER_HOUR + Number(minutes) * SECONDS_PER_MINUTE + Number(seconds);
    return total > 0 ? total : undefined;
};

// In the largest unit the duration fits in whole, otherwise in minutes, rounded up, as the money arrives "within" it.
const toArrivalTime = (seconds: number): CashOutArrivalTime => {
    if (seconds < SECONDS_PER_MINUTE) return { key: 'cashOut.common.arrivalTime.lessThanAMinute' };
    if (seconds % SECONDS_PER_DAY === 0) return { key: 'cashOut.common.arrivalTime.withinDays', count: seconds / SECONDS_PER_DAY };
    if (seconds % SECONDS_PER_HOUR === 0) return { key: 'cashOut.common.arrivalTime.withinHours', count: seconds / SECONDS_PER_HOUR };
    return { key: 'cashOut.common.arrivalTime.withinMinutes', count: Math.ceil(seconds / SECONDS_PER_MINUTE) };
};

/** How long a cashOut in the currency usually takes to arrive: the duration of the currency, otherwise the default one. */
export const getArrivalTime = (arrivalTimes: CashOutArrivalTimes | undefined, currency: string | undefined): CashOutArrivalTime => {
    const seconds =
        toSeconds(currency ? arrivalTimes?.durationByCurrency?.[currency] : undefined) ??
        toSeconds(arrivalTimes?.defaultDuration) ??
        toSeconds(DEFAULT_ARRIVAL_DURATION)!;
    return toArrivalTime(seconds);
};
