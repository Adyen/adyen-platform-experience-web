import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';
import { Reference } from './types';

const useRefWithCallback = <T = any>(
    withCallback: (current: T | null | undefined, previous: T | null | undefined) => any,
    trackedRef?: Reference<T | null | undefined>
) => {
    const ref = trackedRef ?? useRef<T | null | undefined>(null);
    const prevRef = useRef(ref.current);

    useLayoutEffect(
        useCallback(() => {
            if (prevRef.current !== ref.current) {
                try {
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
