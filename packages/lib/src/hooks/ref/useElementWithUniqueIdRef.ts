import { useMemo, useRef } from 'preact/hooks';
import useRefWithCallback from './useRefWithCallback';
import { getUniqueId } from '../../utils/idGenerator';

const useElementWithUniqueIdRef = (identifier: string) => {
    const id = useRef<string>();

    return useRefWithCallback<Element>(
        useMemo(() => {
            id.current = undefined;

            return current => {
                if (current instanceof Element) {
                    current.id = id.current || (id.current = getUniqueId('adyen-fp'));
                }
            };
        }, [identifier]),
        identifier
    );
};

export default useElementWithUniqueIdRef;
