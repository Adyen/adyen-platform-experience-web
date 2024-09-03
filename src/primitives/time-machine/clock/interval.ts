import { enumerable, isFunction } from '../../../utils';
import { createEmitter, Emitter } from '../common/emitter';

export const DEFAULT_INTERVAL_DELAY = 1000;
export const MAXIMUM_INTERVAL_DELAY = 0x7fffffff;

export interface Interval extends AsyncIterable<DOMHighResTimeStamp> {
    (...args: Parameters<Emitter<DOMHighResTimeStamp>>): ReturnType<Emitter<DOMHighResTimeStamp>>;
    readonly cancel: () => void;
    readonly delay: number;
    readonly signal: AbortSignal;
}

export const createInterval = (delay = DEFAULT_INTERVAL_DELAY): Interval => {
    let controller: AbortController = new AbortController();
    let currentTime: DOMHighResTimeStamp;
    let startTime: DOMHighResTimeStamp;

    const intervalDelay = Math.max(0, ~~Math.min(delay ?? DEFAULT_INTERVAL_DELAY, MAXIMUM_INTERVAL_DELAY));

    const asyncIterator = async function* () {
        yield* iterator?.() ?? ('' as unknown as AsyncIterable<DOMHighResTimeStamp>);
    };

    let emitter = createEmitter(asyncIterator);

    let iterator = async function* () {
        try {
            while (true) {
                currentTime ??= (document.timeline?.currentTime as DOMHighResTimeStamp) ?? performance.now();

                currentTime = await new Promise<DOMHighResTimeStamp>(resolve => {
                    const elapsed = currentTime - (startTime ??= currentTime);
                    const roundedElapsed = Math.round(elapsed / intervalDelay) * intervalDelay;
                    const targetNext = startTime + roundedElapsed + intervalDelay;
                    setTimeout(() => requestAnimationFrame(resolve), targetNext - performance.now());
                });

                if (!controller || controller.signal.aborted) break;
                yield currentTime;
            }
        } finally {
            currentTime = undefined!;
        }
    };

    emitter.signal.addEventListener(
        'abort',
        () => {
            controller = emitter = iterator = null!;
        },
        { once: true }
    );

    const interval = ((...args) => {
        if (isFunction(emitter)) emitter(...args);
        else throw new TypeError('Cannot subscribe to cancelled interval');
    }) as Interval;

    return Object.defineProperties(interval, {
        cancel: enumerable(() => emitter?.end()),
        delay: enumerable(intervalDelay),
        signal: enumerable(emitter.signal),
        [Symbol.asyncIterator]: enumerable(asyncIterator),
    });
};

export default createInterval;
