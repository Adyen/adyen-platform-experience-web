import { DEFAULT_INTERVAL_DELAY, MAXIMUM_INTERVAL_DELAY } from './constants';
import { createEmitter, fromEmitter } from '../emitter';
import { enumerable } from '../../../../utils';
import type { Interval } from './types';

export const createInterval = (delay = DEFAULT_INTERVAL_DELAY): Interval => {
    let controller: AbortController = new AbortController();
    let currentTime: DOMHighResTimeStamp;
    let startTime: DOMHighResTimeStamp;

    const intervalDelay = Math.max(0, Math.min(delay ?? DEFAULT_INTERVAL_DELAY, MAXIMUM_INTERVAL_DELAY) | 0);

    let emitter = createEmitter(async function* () {
        try {
            while (controller && !controller.signal.aborted) {
                yield (currentTime ??= performance.now());

                currentTime = await new Promise<DOMHighResTimeStamp>(resolve => {
                    const elapsed = currentTime - (startTime ??= currentTime);
                    const roundedElapsed = Math.round(elapsed / intervalDelay) * intervalDelay;
                    const targetNext = startTime + roundedElapsed + intervalDelay;
                    setTimeout(() => requestAnimationFrame(resolve), targetNext - performance.now());
                });
            }
        } finally {
            currentTime = startTime = undefined!;
        }
    });

    emitter.signal.addEventListener('abort', () => void (controller = emitter = null!), { once: true });

    return Object.defineProperties(fromEmitter(emitter) as Interval, {
        cancel: enumerable(() => emitter?.end()),
        delay: enumerable(intervalDelay),
        signal: enumerable(emitter.signal),
    });
};

export default createInterval;
