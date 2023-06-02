import { useCallback } from 'preact/hooks';
import useRefWithCallback from './useRefWithCallback';
import { getUniqueId } from '../utils/idGenerator';

const useElementRef = (withCallback?: (current: any, previous: any) => any) =>
    useRefWithCallback(
        useCallback(
            (current, previous) => {
                if (current instanceof Element) current.id = getUniqueId('adyen-fp');
                withCallback?.(current, previous);
            },
            [withCallback]
        )
    );

export default useElementRef;
