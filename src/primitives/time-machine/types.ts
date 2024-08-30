export type Month = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
export type MonthDays = 28 | 29 | 30 | 31;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface RecordWithTimezone {
    timezone: string;
}

export type TimezoneDataSource = RecordWithTimezone | RecordWithTimezone['timezone'];
