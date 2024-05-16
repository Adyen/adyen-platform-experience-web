import { useCallback, useRef } from 'preact/hooks';
import { getUniqueId } from '../../primitives/utils/random/idGenerator';
import type { Reflexable } from '../../primitives/reactive/reflex';
import type { Nullable } from '../../primitives/utils';
import useReflex from '../useReflex';

const useUniqueIdentifier = (ref?: Nullable<Reflexable<Element>>) => {
    const id = useRef<string>();

    return useReflex<Element>(
        useCallback(
            (current, previous) => {
                if (previous instanceof Element && previous.id === id.current) previous.id = '';
                if (!(current instanceof Element)) return;
                current.id = id.current || (id.current = getUniqueId('adyen-pe'));
            },
            [ref]
        ),
        ref
    );
};

export default useUniqueIdentifier;
