import { type BaseEmitter } from '../emitter';

export interface Interval extends BaseEmitter<DOMHighResTimeStamp> {
    readonly cancel: () => void;
    readonly delay: number;
    readonly signal: AbortSignal;
}
