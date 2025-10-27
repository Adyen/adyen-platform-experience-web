import { TagProps } from '../Tag/types';
import { TranslationKey } from '../../../translations';

export type TimelineShowMorePlacement = 'bottom' | 'after-first' | 'before-last';

export interface TimelineShowMoreObject {
    limit: number;
    placement?: TimelineShowMorePlacement;
}

export type TimelineGapUnit = 'day';

export interface TimelineGapObject {
    thresholdAmount: number;
    unit: TimelineGapUnit;
}

export type TimelineStatus = 'black' | 'blue' | 'green' | 'red' | 'grey' | 'orange' | 'yellow';

export enum DateFormat {
    FULL_DATE = 'full-date',
    FULL_DATE_EXACT_TIME = 'full-date-exact-time',
    FULL_DATE_EXACT_TIME_WITHOUT_PERIOD = 'full-date-exact-time-without-period',
    SHORT_DATE = 'short-date',
    SHORT_DATE_TIME = 'short-date-time',
}

export interface TimelineTimestamp {
    date: Date;
    format?: DateFormat;
    value?: string;
}

export interface TimelineDataListObject {
    label: string;
    value: string;
    key: TranslationKey;
}

export type TimelineDataList = TimelineDataListObject[];

export type TimelineTagProps = TagProps;

export interface TimelineEntry {
    title?: string;
    description?: string;
    date: Date;
}

export type DateUnit = 'day';
