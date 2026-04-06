import { useMemo, useRef } from 'preact/hooks';
import { DEFAULT_PAGE_LIMIT } from '../constants';
import { getClampedPageLimit } from '../utils';
import { isNumber, mid } from '../../../../utils';
import { BasePaginatedRecordsInitOptions } from './types';

export const getNearestFromSortedUniqueNums = (nums: number[], target: number): number => {
    const lastindex = nums.length - 1;

    if (lastindex < 0) return target;
    if (target <= (nums[0] as number)) return nums[0] as number;
    if (target >= (nums[lastindex] as number)) return nums[lastindex] as number;

    let index = 0,
        lo = 0,
        hi = lastindex;

    while (true) {
        const current = nums[(index = mid(lo, hi))] as number;
        if (lo > hi || target === current) return current;
        target > current ? (lo = index + 1) : (hi = index - 1);
    }
};

const usePageLimit = ({
    preferredLimit = DEFAULT_PAGE_LIMIT,
    preferredLimitOptions,
}: Pick<BasePaginatedRecordsInitOptions<any, any, any, any>, 'preferredLimit' | 'preferredLimitOptions'>) => {
    const cachedLimitOptionsRef = useRef<readonly number[]>();
    const cachedLimitRef = useRef<number>();

    const options = useMemo(() => {
        try {
            const uniqueOptions = new Set<number>();

            for (const option of preferredLimitOptions as number[]) {
                const limit = getClampedPageLimit(option);
                if (limit > 0) uniqueOptions.add(limit);
            }

            return Object.freeze([...uniqueOptions].sort((a, b) => a - b));
        } catch {
            /* ignore exception — no options available */
        }
    }, [preferredLimitOptions]);

    const limit = useMemo(() => {
        let limit = getClampedPageLimit(preferredLimit) || DEFAULT_PAGE_LIMIT;

        parsing: try {
            const uniqueOptions = new Set((cachedLimitOptionsRef.current = options));

            if (uniqueOptions.size === 0) {
                cachedLimitOptionsRef.current = undefined;
                break parsing;
            }

            if (cachedLimitRef.current !== limit) {
                selection: {
                    if (uniqueOptions.size === uniqueOptions.add(limit).size) {
                        break selection;
                    } else uniqueOptions.delete(limit);

                    if (uniqueOptions.size === uniqueOptions.add(cachedLimitRef.current as number).size) {
                        if (isNumber(cachedLimitRef.current)) {
                            limit = cachedLimitRef.current;
                            break selection;
                        }
                    } else uniqueOptions.delete(cachedLimitRef.current as number);

                    // limit = cachedLimitOptionsRef.current?.[0] as number;
                    limit = getNearestFromSortedUniqueNums(cachedLimitOptionsRef.current as number[], limit);
                }
            }
        } catch {
            /* ignore exception here — there are no options */
        }

        return (cachedLimitRef.current = limit);
    }, [options, preferredLimit]);

    return { limit, limitOptions: options } as const;
};

export default usePageLimit;
