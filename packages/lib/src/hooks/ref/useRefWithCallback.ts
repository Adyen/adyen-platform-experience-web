import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Reference } from './types';

const useRefWithCallback = <T = any>(
    withCallback: (current: T | null | undefined, previous: T | null | undefined) => any,
    trackedRef?: Reference<T | null | undefined>
) => {
    const ref = trackedRef ?? useRef<T | null | undefined>(null);
    const prevRef = useRef(ref.current);
    const [, setLastConnected] = useState<DOMHighResTimeStamp>();

    useLayoutEffect(
        useCallback(() => {
            if (prevRef.current !== ref.current) {
                try {
                    setLastConnected(performance.now());
                    withCallback(ref.current, prevRef.current);
                } finally {
                    prevRef.current = ref.current;
                }
            }
        }, [withCallback])
    );

    return ref;
};

export default useRefWithCallback;
