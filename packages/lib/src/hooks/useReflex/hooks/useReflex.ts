import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { createReflexContainer } from '../core/reflex';
import type { Nullable, Reflex, Reflexable, ReflexAction } from '../types';

const useReflex = <T = any>(action: ReflexAction<T>, reflexable?: Nullable<Reflexable<T>>) => {
    const container = useRef(createReflexContainer<T>());

    useLayoutEffect(() => container.current.release, []);

    return useMemo(() => {
        container.current.update(action, reflexable);
        return container.current.reflex as Reflex<T>;
    }, [action, reflexable]);
};

export default useReflex;
