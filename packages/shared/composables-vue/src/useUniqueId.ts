import { uniqueId } from '@integration-components/utils';

/**
 * Vue equivalent of the Preact `useUniqueId` hook.
 * Returns a stable unique numeric string (no prefix) for use in DOM IDs.
 */
export function useUniqueId(): string {
    return uniqueId().replace(/.*?(?=\d+$)/, '');
}

export default useUniqueId;
