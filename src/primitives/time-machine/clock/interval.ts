import { enumerable } from '../../../utils';
import type { Interval } from './types';

export const DEFAULT_INTERVAL_DELAY = 1000;
export const MAXIMUM_INTERVAL_DELAY = 0x7fffffff;

export const createInterval = (delay = DEFAULT_INTERVAL_DELAY): Interval => {
    let activeIterators = 0;
    let controller: AbortController = new AbortController();
    let intervalDelay = Math.max(0, ~~Math.min(delay ?? DEFAULT_INTERVAL_DELAY, MAXIMUM_INTERVAL_DELAY));
    let nextTimePromiseResolve: (value: DOMHighResTimeStamp | null | PromiseLike<DOMHighResTimeStamp | null>) => void;
    let nextTimePromise: Promise<DOMHighResTimeStamp | null>;
    let startTime: DOMHighResTimeStamp;

    let cancel = () => {
        controller?.abort();
        controller = cancel = iterator = nextTimePromise = nextTimePromiseResolve = null!;
    };

    let iterator = async function* (signal?: AbortSignal) {
        try {
            activeIterators++ || scheduleFrame();
            while (true) {
                const time = await nextTimePromise;
                if (time && !(signal && signal.aborted)) yield time;
                else break;
            }
        } finally {
            --activeIterators || nextTimePromiseResolve?.(null);
        }
    };

    const scheduleFrame = (time = (document.timeline?.currentTime as DOMHighResTimeStamp) ?? performance.now()) => {
        let rafId: ReturnType<typeof requestAnimationFrame>;
        let timeoutId: ReturnType<typeof setTimeout>;

        nextTimePromise = new Promise<DOMHighResTimeStamp | null>(resolve => {
            const elapsed = time - (startTime ??= time);
            const roundedElapsed = Math.round(elapsed / intervalDelay) * intervalDelay;
            const targetNext = startTime + roundedElapsed + intervalDelay;

            nextTimePromiseResolve = resolve;

            timeoutId = setTimeout(() => {
                rafId = requestAnimationFrame(resolve);
            }, targetNext - performance.now());
        }).then(time => (!controller || controller.signal.aborted ? null : time));

        nextTimePromise.then(time => {
            if (time) scheduleFrame(time);
            else {
                cancelAnimationFrame(rafId);
                clearTimeout(timeoutId);
                rafId = timeoutId = null!;
            }
        });
    };

    const interval = async function* (signal) {
        yield* iterator?.(signal) ?? ('' as unknown as AsyncIterable<DOMHighResTimeStamp>);
    } as Interval;

    return Object.defineProperties(interval, {
        cancel: enumerable(() => cancel?.()),
        delay: enumerable(intervalDelay),
        signal: enumerable(controller.signal),
    });
};

export default createInterval;
