import { delay, http } from 'msw';
import type { SetupWorker } from 'msw/browser';

export type DelayedEndpoints<T extends Record<string, string>> = Partial<Record<keyof T, number>>;

export const provisionDelayedEndpoints = <T extends Record<string, string>>(
    worker: Pick<SetupWorker, 'use'>,
    endpoints: T,
    delayedEndpoints?: DelayedEndpoints<T>
) => {
    (Object.entries(delayedEndpoints ?? {}) as [keyof T, number][]).forEach(([endpoint, delayMs]) => {
        // Resolving nothing lets MSW fall through to the regular handler once the delay elapses.
        worker.use(http.all(endpoints[endpoint], () => delay(delayMs)));
    });
};
