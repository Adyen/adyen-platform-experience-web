import type { AtomicMembers, MoleculeResult } from '../shared/types';

import { useCallback, useMemo } from 'preact/hooks';
import { createValuesComputeFn } from './valuesCompute';
import { hasOwnProperty } from '../../../utils';

export interface MoleculeProps<T extends Record<string, any>> {
    members: AtomicMembers<T>;
}

export const useMolecule = <T extends Record<string, any>>({ members }: MoleculeProps<T>): MoleculeResult<T> => {
    const computeValues = useMemo(createValuesComputeFn<T>, []);
    const keys = useMemo(() => Object.keys(members) as (keyof T)[], [members]);

    // prettier-ignore
    const equals = useCallback<MoleculeResult<T>['equals']>(
        compareValue =>
            keys.every(key => {
                return hasOwnProperty(compareValue, key)
                    ? members[key].equals(compareValue[key] as T[keyof T])
                    : true;
            }),
        [members, keys]
    );

    const set = useCallback<MoleculeResult<T>['set']>(
        value => {
            keys.forEach(key => {
                if (hasOwnProperty(value, key)) {
                    members[key].set(value[key] as T[keyof T]);
                }
            });
        },
        [members, keys]
    );

    const reset = useMemo<MoleculeResult<T>['reset']>(() => {
        return reset;

        function reset(): void;
        function reset(value: Readonly<T>): void;
        function reset(...args: [value?: Readonly<T>]): void {
            if (args.length > 0) {
                const resetValue = args[0]!;

                keys.forEach(key => {
                    const member = members[key];
                    member.reset(hasOwnProperty(resetValue, key) ? resetValue[key] : member.value);
                });
            } else {
                keys.forEach(key => members[key].reset());
            }
        }
    }, [members, keys]);

    // prettier-ignore
    const pristine = useMemo(
        () => keys.every(key => members[key].pristine),
        [members, keys]
    );

    // prettier-ignore
    const { latestValue: $value, usedValue: value } = useMemo(
        () => computeValues(keys, members),
        [computeValues, members, keys]
    );

    const stale = useMemo(() => !equals($value), [equals, $value]);

    // prettier-ignore
    return useMemo(
        () => ({ equals, pristine, reset, set, stale, value, $value }),
        [equals, pristine, reset, set, stale, value, $value]
    );
};

export default useMolecule;
