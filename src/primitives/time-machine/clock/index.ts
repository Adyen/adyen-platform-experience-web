import { createEmitter, fromEmitter } from '../common/emitter';
import { createInterval } from '../common/interval';

export const clock = (() => {
    const interval = createInterval(1000);
    return fromEmitter(
        createEmitter(
            () => interval,
            () => Date.now()
        )
    );
})();

export default clock;
