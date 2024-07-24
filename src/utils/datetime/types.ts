export interface DateFunction<ReturnType> {
    (date?: DateValue): ReturnType;
    (
        year: number | string,
        monthIndex: number | string,
        day?: number | string,
        hours?: number | string,
        minutes?: number | string,
        seconds?: number | string,
        milliseconds?: number | string
    ): ReturnType;
}

export type DateTimeComponents = [
    year: number,
    monthIndex: number,
    day?: number,
    hours?: number,
    minutes?: number,
    seconds?: number,
    milliseconds?: number
];

export type DateValue = Date | number | string;
