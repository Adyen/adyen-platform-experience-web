import { EDGE_COLLAPSE, END_EDGE, FARTHEST_EDGE, NEAREST_EDGE, START_EDGE } from './constants';
import { TimeSelectionAtoms, TimeSelectionSnapEdge } from './types';
import { Time } from '../shared/types';
import { clamp, computeTimestampOffset } from '../shared/utils';
import watchable from '../shared/watchable';
import { Watchable, WatchAtoms } from '../shared/watchable/types';
import { TimeOrigin, TimeOriginAtoms } from '../timeorigin/types';

export default class __TimeSelection__ {
    #origin: TimeOrigin;
    #originMonthStartTimestamp: number;
    #originTimeSliceStartTimestamp: number;
    #originTimeSliceEndTimestamp: number;

    #selectionStartTimestamp: number;
    #selectionStartTimestampOffset?: number;

    #selectionEndTimestamp: number;
    #selectionEndTimestampOffset?: number;

    readonly #watchable: Watchable<TimeSelectionAtoms>;

    constructor(origin: TimeOrigin) {
        this.#origin = origin;
        this.#originMonthStartTimestamp = origin.month.timestamp;
        this.#originTimeSliceStartTimestamp = origin.timeslice.from;
        this.#originTimeSliceEndTimestamp = origin.timeslice.to;
        this.#selectionStartTimestamp = this.#selectionEndTimestamp = origin.time;

        this.#watchable = watchable({
            from: () => this.#selectionStartTimestamp,
            to: () => this.#selectionEndTimestamp,
        } as WatchAtoms<TimeSelectionAtoms>);

        this.updateSelection = this.updateSelection.bind(this);
        this.#computeTimestampOffsets();

        this.#origin.watch(snapshot => {
            if (typeof snapshot === 'symbol') return;
            this.#onOriginUpdated(snapshot);
            this.#watchable.notify();
        });
    }

    get watchable() {
        return this.#watchable;
    }

    get selectionEndTimestamp() {
        return this.#selectionEndTimestamp;
    }

    get selectionEndTimestampOffset() {
        return this.#selectionEndTimestampOffset as number;
    }

    get selectionStartTimestamp() {
        return this.#selectionStartTimestamp;
    }

    get selectionStartTimestampOffset() {
        return this.#selectionStartTimestampOffset as number;
    }

    set start(time: Time | null | undefined) {
        const selectionTime = time == undefined ? this.#origin.time : time;
        this.updateSelection(selectionTime, START_EDGE);
    }

    set end(time: Time | null | undefined) {
        const selectionTime = time == undefined ? this.#origin.time : time;
        this.updateSelection(selectionTime, END_EDGE);
    }

    #computeTimestampOffsets() {
        this.#selectionStartTimestampOffset = computeTimestampOffset(this.#selectionStartTimestamp);
        this.#selectionEndTimestampOffset = computeTimestampOffset(this.#selectionEndTimestamp);
    }

    #onOriginUpdated({ fromTimestamp, toTimestamp, monthTimestamp }: TimeOriginAtoms) {
        if (!(this.#originTimeSliceStartTimestamp === fromTimestamp && this.#originTimeSliceEndTimestamp === toTimestamp)) {
            this.#originTimeSliceStartTimestamp = this.#origin.timeslice.from;
            this.#originTimeSliceEndTimestamp = this.#origin.timeslice.to;

            this.#selectionStartTimestamp = Math.max(this.#selectionStartTimestamp, this.#originTimeSliceStartTimestamp);
            this.#selectionEndTimestamp = Math.min(this.#selectionEndTimestamp, this.#originTimeSliceEndTimestamp);
            this.#computeTimestampOffsets();
        }

        if (this.#originMonthStartTimestamp !== monthTimestamp) {
            this.#originMonthStartTimestamp = this.#origin.month.timestamp;
        }
    }

    updateSelection(time: Time, snapBehavior?: TimeSelectionSnapEdge | typeof EDGE_COLLAPSE) {
        const timestamp = clamp(this.#originTimeSliceStartTimestamp, new Date(time).getTime(), this.#originTimeSliceEndTimestamp);

        if (snapBehavior === FARTHEST_EDGE) {
            if (timestamp <= this.#selectionStartTimestamp) snapBehavior = END_EDGE;
            else if (timestamp >= this.#selectionEndTimestamp) snapBehavior = START_EDGE;
        }

        switch (snapBehavior) {
            case START_EDGE:
                this.#selectionStartTimestamp = timestamp;
                this.#selectionEndTimestamp = Math.max(this.#selectionStartTimestamp, this.#selectionEndTimestamp);
                break;
            case END_EDGE:
                this.#selectionEndTimestamp = timestamp;
                this.#selectionStartTimestamp = Math.min(this.#selectionStartTimestamp, this.#selectionEndTimestamp);
                break;
            case FARTHEST_EDGE:
            case NEAREST_EDGE: {
                let startDistance = Math.abs(timestamp - this.#selectionStartTimestamp);
                let endDistance = Math.abs(timestamp - this.#selectionEndTimestamp);

                if (snapBehavior === NEAREST_EDGE) {
                    [startDistance, endDistance] = [endDistance, startDistance];
                }

                if (startDistance > endDistance) {
                    this.#selectionStartTimestamp = timestamp;
                } else this.#selectionEndTimestamp = timestamp;

                break;
            }
            case EDGE_COLLAPSE:
            default:
                this.#selectionStartTimestamp = this.#selectionEndTimestamp = timestamp;
                break;
        }

        this.#computeTimestampOffsets();
        this.#watchable.notify();
    }
}
