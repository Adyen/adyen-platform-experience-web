import { computed } from 'vue';
import { createInputNormalizer } from '@integration-components/transactions/domain';

export function useInputNormalizer(maxChars = Infinity) {
    return computed(() => createInputNormalizer(maxChars).normalize);
}
