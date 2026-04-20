import { useRef } from 'preact/hooks';
import { uniqueId } from '@integration-components/utils';

export const useUniqueId = () => {
    return useRef(uniqueId().replace(/.*?(?=\d+$)/, '')).current;
};

export default useUniqueId;
