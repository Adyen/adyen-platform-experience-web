import { Ref, useCallback, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Nullable, Reflex } from '../useReflex';
import { isReflex } from '../useReflex/core/utils';
import createReflexContainer from '../useReflex/core/reflex';

// [TODO]: This should belong to a shared type module
type List<T = any> = (List<T> | T)[];

const EXCESS_SPACE_REGEX = /^\s+|\s+(?=\s|$)/g;

const uniqueFlatten = <T>(items: List<T>, uniqueItems: Set<T> = new Set<T>()) => {
    for (const item of items) {
        if (!Array.isArray(item)) {
            uniqueItems.delete(item);
            uniqueItems.add(item);
        } else uniqueFlatten(item, uniqueItems);
    }
    return uniqueItems;
};

const useIdentifierString = (...refs: List<Nullable<Ref<Element> | Reflex<Element>>>) => {
    const $id = useRef<string>('');
    const $cleanups = useRef<(() => void)[]>([]);
    const $cachedRefs = useRef<(Ref<Element> | Reflex<Element>)[]>([]);

    const [shouldRecomputeID, setShouldRecomputeID] = useState(true);
    const reflexAction = useCallback(() => setShouldRecomputeID(true), [setShouldRecomputeID]);

    const $refs = useMemo(() => {
        while (true) {
            const cleanup = $cleanups.current.pop();
            if (!cleanup) break;
            cleanup();
        }

        const $refs: (Ref<Element> | Reflex<Element>)[] = [];

        for (const ref of uniqueFlatten(refs)) {
            if (!ref) continue;

            if (isReflex(ref)) {
                const container = createReflexContainer();
                $cleanups.current.push(container.release);
                container.update(reflexAction, ref);
            }

            $refs.push(ref);
        }

        return $refs;
    }, [reflexAction, ...refs]);

    useLayoutEffect(() => {
        if (shouldRecomputeID || $refs !== $cachedRefs.current) {
            const IDS = new Set<string>();

            for (const ref of $refs) {
                const id = ref?.current?.id ?? '';
                if (!id) continue;
                IDS.delete(id);
                IDS.add(id);
            }

            $id.current = [...IDS].join(' ').replace(EXCESS_SPACE_REGEX, '');
            $cachedRefs.current = $refs;
            setShouldRecomputeID(false);
        }
    }, [$refs, shouldRecomputeID, setShouldRecomputeID]);

    return $id.current;
};

export default useIdentifierString;
