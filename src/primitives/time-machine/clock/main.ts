import { createInterval } from './interval';
import { createEmitter } from '../common/emitter';

export const clock = (() => {
    const interval = createInterval(1000);
    const emitter = createEmitter(
        () => interval,
        () => Date.now()
    );
    return (...args: Parameters<typeof emitter>) => emitter(...args);
})();

export default clock;
