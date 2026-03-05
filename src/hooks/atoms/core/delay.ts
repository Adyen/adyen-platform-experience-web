export type DelayConfig = {
    delay?: number;
};

export type DelayScheduler = {
    readonly exec: (fn: () => void) => void;
    readonly cancel: () => void;
    readonly dispose: () => void;
    readonly reconfigure: (config: DelayConfig) => void;
};

export const createDelay = (config?: DelayConfig): DelayScheduler => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let delay = normalizeDelay(config?.delay);
    let disposed = false;

    const cancel = () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
        }
    };

    const exec = (fn: () => void) => {
        if (disposed) return;
        cancel();

        if (delay > 0) {
            timeoutId = setTimeout(() => {
                timeoutId = undefined;
                fn();
            }, delay);
        } else {
            fn();
        }
    };

    const dispose = () => {
        cancel();
        disposed = true;
    };

    const reconfigure = (config: DelayConfig) => {
        delay = normalizeDelay(config.delay);
    };

    return { exec, cancel, dispose, reconfigure };
};

const normalizeDelay = (value?: number) => Math.max(0, Math.round(value ?? 0) || 0);

export default createDelay;
