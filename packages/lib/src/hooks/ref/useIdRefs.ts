import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { List, Reference } from './types';
import useDebouncedRequestAnimationFrameCallback from '../useDebouncedRequestAnimationFrameCallback';
import useRefWithCallback from './useRefWithCallback';

const useIdRefs = (...refs: List<Reference<any>>) => {
    const [ids, setIds] = useState('');

    useLayoutEffect(() => {
        const uniqueFlatten = (uniqueRefObjects: Set<Reference<any>>, refs: List<Reference<any>>) => {
            for (const ref of refs) {
                if (Array.isArray(ref)) uniqueFlatten(uniqueRefObjects, ref);
                else if (!uniqueRefObjects.has(ref)) uniqueRefObjects.add(ref);
            }
            return uniqueRefObjects;
        };

        const reducer = (ids: string | undefined, ref: Reference<any>) => {
            const elemId = ref?.current instanceof Element ? ref.current.id : '';
            return elemId ? (ids ? `${ids} ${elemId}` : elemId) : ids ?? '';
        };

        const $refs = [...uniqueFlatten(new Set<Reference<any>>(), refs)];
        const recompute = useDebouncedRequestAnimationFrameCallback(() => setIds($refs.reduce(reducer, '')));

        for (const ref of $refs) {
            useRefWithCallback((current: any) => {
                if (current instanceof HTMLElement) recompute();
            });
        }
    }, []);

    return ids;
};

export default useIdRefs;
