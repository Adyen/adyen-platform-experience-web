import { createInterval } from './interval';

export const clock = (() => {
    const interval = createInterval(1000);
    return async function* (signal?: AbortSignal) {
        for await (const o_O of interval(signal)) yield Date.now();
    };
})();

export default clock;
