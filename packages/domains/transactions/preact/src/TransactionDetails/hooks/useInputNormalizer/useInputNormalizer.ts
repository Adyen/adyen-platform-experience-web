import { useMemo } from 'preact/hooks';
import { createInputNormalizer } from '../../../../../domain/src';

export { createInputNormalizer } from '../../../../../domain/src';

export const useInputNormalizer = (maxChars = Infinity) => useMemo(() => createInputNormalizer(maxChars).normalize, [maxChars]);

export default useInputNormalizer;
