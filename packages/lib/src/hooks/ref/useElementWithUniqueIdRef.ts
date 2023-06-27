import { useCallback, useRef } from 'preact/hooks';
import { NullableTrackableRefArgument } from './types';
import { getUniqueId } from '../../utils/idGenerator';
import useRefWithCallback from './useRefWithCallback';

const useElementWithUniqueIdRef = (ref?: NullableTrackableRefArgument<Element>) => {
    const id = useRef<string>();

    return useRefWithCallback<Element>(
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

export default useElementWithUniqueIdRef;
