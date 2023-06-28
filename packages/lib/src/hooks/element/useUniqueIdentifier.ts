import { useCallback, useRef } from 'preact/hooks';
import useReflex, { NullableReflexable } from '../useReflex';
import { getUniqueId } from '../../utils/idGenerator';

const useUniqueIdentifier = (ref?: NullableReflexable<Element>) => {
    const id = useRef<string>();

    return useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;
                current.id = id.current || (id.current = getUniqueId('adyen-fp'));
            },
            [ref]
        ),
        ref
    );
};

export default useUniqueIdentifier;
