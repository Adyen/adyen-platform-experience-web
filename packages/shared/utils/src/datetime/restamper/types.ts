export type RestampContext = {
    TIMEZONE?: string;
    formatter?: Intl.DateTimeFormat;
};

export type RestampResult = Readonly<{
    formatted: string | undefined;
    offset: number;
    timestamp: number;
}>;

export interface Restamper {
    (time?: string | number | Date): RestampResult;
}

export interface RestamperWithTimezone extends Restamper {
    get tz(): {
        get current(): RestampContext['TIMEZONE'];
        set current(timezone: RestampContext['TIMEZONE'] | null);
        readonly system: RestampContext['TIMEZONE'];
    };
    set tz(timezone: RestampContext['TIMEZONE'] | null);
}
