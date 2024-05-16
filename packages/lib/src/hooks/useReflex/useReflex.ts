import { useLayoutEffect, useMemo, useRef } from 'preact/hooks';
import { createReflexContainer, Reflex, Reflexable, ReflexAction } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../primitives/utils';

const useReflex = <T = any>(action: ReflexAction<T>, reflexable?: Nullable<Reflexable<T>>) => {
    const container = useRef(createReflexContainer<T>());

    useLayoutEffect(() => container.current.release, []);

    return useMemo(() => {
        container.current.update(action, reflexable);
        return container.current.reflex as Reflex<T>;
    }, [action, reflexable]);
};

export default useReflex;
