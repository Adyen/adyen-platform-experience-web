import { useEffect, useMemo, useRef } from 'preact/hooks';

export type Delay = {
    readonly exec: <Fn extends () => unknown>(fn: Fn) => void;
    readonly cancel: () => void;
};

export type DelayProps = {
    delay?: number;
};

export const useDelay = (props?: DelayProps): Delay => {
    const timeoutId = useRef<ReturnType<typeof setTimeout>>();
    const delay = useRef(0);

    // Deterministic from props, idempotent — safe to assign during render
    delay.current = Math.max(0, Math.round(props?.delay ?? 0) || 0);

    const { cancel, exec } = useMemo(() => {
        const cancel = () => {
            timeoutId.current && clearTimeout(timeoutId.current);
            timeoutId.current = undefined;
        };

        const exec: <Fn extends () => unknown>(fn: Fn) => void = fn => {
            cancel();

            if (delay.current > 0) {
                timeoutId.current = setTimeout(() => {
                    cancel();
                    fn();
                }, delay.current);
            } else fn();
        };

        return { cancel, exec } as const;
    }, []);

    useEffect(() => {
        return cancel;
    }, [cancel]);

    return { cancel, exec } as const;
};

export default useDelay;
