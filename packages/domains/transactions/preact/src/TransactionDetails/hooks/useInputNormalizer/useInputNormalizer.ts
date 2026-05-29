import { useMemo } from 'preact/hooks';
import { createInputNormalizer } from '@integration-components/transactions/domain';

export { createInputNormalizer } from '@integration-components/transactions/domain';

export const useInputNormalizer = (maxChars = Infinity) => useMemo(() => createInputNormalizer(maxChars).normalize, [maxChars]);

export default useInputNormalizer;
