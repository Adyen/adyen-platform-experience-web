import { RANGE_FROM, RANGE_TO } from '../constants';
import { Time, TimeFrameRangeEdge } from '../types';
import { computeTimestampOffset, getEdgesDistance } from '../utils';

export default class __TimeSlice__ {
    readonly #numberOfMonths: number = Infinity;
    readonly #endTimestamp: number = Infinity;
    readonly #startTimestamp: number = -Infinity;
    readonly #endTimestampOffset: number = 0;
    readonly #startTimestampOffset: number = 0;

    constructor(timezone?: string, fromTime?: Time, toTime?: Time);
    constructor(timezone?: string, time?: Time, timeEdge?: TimeFrameRangeEdge);
    constructor(...args: any[]) {
        if (args.length >= 3) {
            let timestamp = new Date(args[1]).getTime();

            if (typeof args[2] !== 'symbol') {
                this.#startTimestamp = timestamp || this.#startTimestamp;
                this.#endTimestamp = new Date(args[2]).getTime() || this.#endTimestamp;

                if (this.#endTimestamp < this.#startTimestamp) {
                    [this.#endTimestamp, this.#startTimestamp] = [this.#startTimestamp, this.#endTimestamp];
                }

                this.#startTimestampOffset = computeTimestampOffset(this.#startTimestamp, args[0]);
                this.#endTimestampOffset = computeTimestampOffset(this.#endTimestamp, args[0]);
                this.#numberOfMonths = getEdgesDistance(this.#startTimestamp, this.#endTimestamp, args[0]) + 1;
            } else if (!isNaN(timestamp)) {
                switch (args[2]) {
                    case RANGE_TO:
                        this.#endTimestamp = timestamp;
                        this.#endTimestampOffset = computeTimestampOffset(this.#endTimestamp, args[0]);
                        break;

                    case RANGE_FROM:
                    default:
                        this.#startTimestamp = timestamp;
                        this.#startTimestampOffset = computeTimestampOffset(this.#startTimestamp, args[0]);
                        break;
                }
            }
        }
    }

    get numberOfMonths() {
        return this.#numberOfMonths;
    }

    get endTimestamp() {
        return this.#endTimestamp;
    }

    get endTimestampOffset() {
        return this.#endTimestampOffset;
    }

    get startTimestamp() {
        return this.#startTimestamp;
    }

    get startTimestampOffset() {
        return this.#startTimestampOffset;
    }
}
