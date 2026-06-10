import { computed } from 'vue';
import { createInputNormalizer } from '../../../../domain/src';

export function useInputNormalizer(maxChars = Infinity) {
    return computed(() => createInputNormalizer(maxChars).normalize);
}
