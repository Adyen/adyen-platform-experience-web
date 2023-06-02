import { useMemo } from 'preact/hooks';
import { List, Reference } from './types';
import { flatten } from './utils';

const useIdRefs = (...refs: List<Reference<any>>) => useMemo(() => flatten(...refs), [refs]);

export default useIdRefs;
