import { useCallback, useLayoutEffect, useRef } from 'preact/hooks';

const useDebouncedRequestAnimationFrameCallback = (frameCallback: FrameRequestCallback) => {
    const raf = useRef<number>();

    const cancelRaf = useCallback((nextRaf?: number) => {
        cancelAnimationFrame(raf.current as number);
        raf.current = nextRaf;
    }, []);

    useLayoutEffect(() => cancelRaf, []);

    return useCallback(() => {
        cancelRaf(requestAnimationFrame(frameCallback));
    }, [frameCallback]);
};

export default useDebouncedRequestAnimationFrameCallback;
