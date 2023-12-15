import { useCallback, useRef } from 'preact/hooks';
import useReflex, { Nullable, Reflexable } from '../useReflex';
import { getUniqueId } from '@src/utils/idGenerator';

const useUniqueIdentifier = (ref?: Nullable<Reflexable<Element>>) => {
    const id = useRef<string>();

    return useReflex<Element>(
        useCallback(
            (current, previous) => {
                if (previous instanceof Element && previous.id === id.current) previous.id = '';
                if (!(current instanceof Element)) return;
                current.id = id.current || (id.current = getUniqueId('adyen-fp'));
            },
            [ref]
        ),
        ref
    );
};

export default useUniqueIdentifier;
