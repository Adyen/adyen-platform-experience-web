import { createInterval } from './interval';
import { isFunction, noop } from '../../../utils';

export const clock = (() => {
    const interval = createInterval(1000);

    return (callback: () => unknown): (() => void) => {
        if (!isFunction(callback)) return noop;

        let cancel = () => {
            controller.abort();
            controller = cancel = null!;
        };

        let controller = new AbortController();

        (async () => {
            for await (const o_O of interval(controller.signal)) {
                try {
                    callback();
                } catch (ex) {
                    cancel?.();
                    throw ex;
                }
            }
        })();

        return () => cancel?.();
    };
})();

export default clock;
