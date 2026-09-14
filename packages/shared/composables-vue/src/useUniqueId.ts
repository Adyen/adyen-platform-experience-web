import { uniqueId } from '@integration-components/utils';

/**
 * Returns a stable unique ID.
 * Returns a stable unique numeric string (no prefix) for use in DOM IDs.
 */
export function useUniqueId(): string {
    return uniqueId().replace(/^(?:.*\D)?(?=\d+$)/, '');
}

export default useUniqueId;
