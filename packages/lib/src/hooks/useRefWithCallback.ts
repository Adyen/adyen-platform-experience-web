import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';

const useRefWithCallback = (withCallback: (current: any, previous: any) => any) => {
    const ref = useRef<any>(null);
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
