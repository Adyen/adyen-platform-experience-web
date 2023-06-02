import { useCallback, useEffect, useLayoutEffect, useRef } from 'preact/hooks';

const useRefWithCallback = (withCallback: (current: any, previous: any) => any) => {
    const ref = useRef<any>(null);
    const prevRef = useRef(ref.current);

    const unset = useCallback(() => {
        prevRef.current = ref.current = null;
    }, []);

    const refresh = useCallback(() => {
        if (prevRef.current !== ref.current) {
            try {
                withCallback(ref.current, prevRef.current);
            } finally {
                prevRef.current = ref.current;
            }
        }
    }, [withCallback]);

    useLayoutEffect(refresh);
    useEffect(() => unset, []);
    return ref;
};

export default useRefWithCallback;
