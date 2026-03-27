import { uniqueId } from '../../utils';
import { useCallback, useRef } from 'preact/hooks';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../utils/types';
import useReflex from '../useReflex';

const useUniqueIdentifier = (ref?: Nullable<Reflexable<Element>>) => {
    const idRef = useRef<string>();

    return useReflex<Element>(
        useCallback(
            (current, previous) => {
                if (previous instanceof Element && previous.id === idRef.current) previous.id = '';
                if (!(current instanceof Element)) return;
                current.id = idRef.current || (idRef.current = uniqueId());
            },
            [ref]
        ),
        ref
    );
};

export default useUniqueIdentifier;
