import { FROM_EDGE, TO_EDGE } from './constants';
import { TimeSliceEdge } from './types';
import { Time } from '../shared/types';
import { computeTimestampOffset, getEdgesDistance } from '../shared/utils';

export default class __TimeSlice__ {
    readonly #numberOfMonths: number = Infinity;
    readonly #endTimestamp: number = Infinity;
    readonly #startTimestamp: number = -Infinity;
    readonly #endTimestampOffset: number = 0;
    readonly #startTimestampOffset: number = 0;

    constructor(fromTime?: Time, toTime?: Time);
    constructor(time?: Time, timeEdge?: TimeSliceEdge);
    constructor(...args: any[]) {
        if (args.length >= 2) {
            let timestamp = new Date(args[0]).getTime();

            if (typeof args[1] !== 'symbol') {
                this.#startTimestamp = timestamp || this.#startTimestamp;
                this.#endTimestamp = new Date(args[1]).getTime() || this.#endTimestamp;

                if (this.#endTimestamp < this.#startTimestamp) {
                    [this.#endTimestamp, this.#startTimestamp] = [this.#startTimestamp, this.#endTimestamp];
                }

                this.#startTimestampOffset = computeTimestampOffset(this.#startTimestamp);
                this.#endTimestampOffset = computeTimestampOffset(this.#endTimestamp);
                this.#numberOfMonths = getEdgesDistance(this.#startTimestamp, this.#endTimestamp) + 1;
            } else if (timestamp === timestamp) {
                switch (args[1]) {
                    case TO_EDGE:
                        this.#endTimestamp = timestamp;
                        this.#endTimestampOffset = computeTimestampOffset(this.#endTimestamp);
                        break;

                    case FROM_EDGE:
                    default:
                        this.#startTimestamp = timestamp;
                        this.#startTimestampOffset = computeTimestampOffset(this.#startTimestamp);
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
