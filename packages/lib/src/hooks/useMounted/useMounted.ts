import { useEffect, useMemo, useRef } from 'preact/hooks';

const useMounted = <U extends ((...args: any[]) => any)>(beforeUnmount?: U) => {
    const $mounted = useRef(false);
    const unmount = useMemo(() => beforeUnmount, [beforeUnmount]);

    useEffect(() => {
        $mounted.current = true;

        return () => {
            $mounted.current = false;
            unmount && unmount();
        };
    }, [unmount]);

    return $mounted;
};

export default useMounted;
