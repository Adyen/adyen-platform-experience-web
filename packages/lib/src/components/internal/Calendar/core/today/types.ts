export type Today = {
    readonly timestamp: number;
    readonly watch: (callback: TodayWatchCallback) => () => void;
};

export type TodayWatchCallback = (...args: any[]) => any;
