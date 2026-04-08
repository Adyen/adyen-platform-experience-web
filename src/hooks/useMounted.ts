import { useEffect, useMemo, useRef } from 'preact/hooks';

const useMounted = <U extends (...args: any[]) => any>(beforeUnmount?: U) => {
    const $mountedRef = useRef(false);
    const unmount = useMemo(() => beforeUnmount, [beforeUnmount]);

    useEffect(() => {
        $mountedRef.current = true;

        return () => {
            $mountedRef.current = false;
            unmount && unmount();
        };
    }, [unmount]);

    return $mountedRef;
};

export default useMounted;
