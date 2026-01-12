import { useMemo } from 'preact/hooks';
import { BLACKLISTED_CHARS } from './constants';
import { assertInteger, assertPositive } from './utils';
import { boolOrFalse, enumerable, identity, struct } from '../../../../../../utils';
import type { InputNormalizer } from './types';

export const createInputNormalizer = (maxChars = Infinity) => {
    type _TruncateString = (value: string, maxlength?: number) => string;

    if (maxChars !== Infinity) {
        const subject = 'Character limit';
        assertInteger(maxChars, subject);
        assertPositive(maxChars, subject);
    }

    const _extensiveNormalize = (input: string) => {
        let substringChars = maxChars === Infinity ? input.length : maxChars;
        let normalizedChars = 0;
        let normalized = '';

        while (true) {
            let substring = input
                .slice(normalizedChars, (normalizedChars += substringChars))
                .replace(BLACKLISTED_CHARS, '')
                .replace(/\s/g, ' ');

            if (normalized.length === 0) {
                substring = substring.trimStart();
            }

            normalized += _truncate(substring, maxChars - normalized.length);

            if (normalized.length === maxChars) break;
            if (normalizedChars >= input.length) break;
        }

        return normalized;
    };

    const _fastNormalize = (input: string) => _truncate(input.trimStart().replace(BLACKLISTED_CHARS, ''));

    const _truncate: _TruncateString =
        maxChars === Infinity ? (identity as _TruncateString) : (value, maxlength = maxChars) => value.slice(0, maxlength);

    const normalize = (input: string, extensive = false) => (boolOrFalse(extensive) ? _extensiveNormalize : _fastNormalize)(input);

    return struct<InputNormalizer>({
        normalize: enumerable(normalize),
    });
};

export const useInputNormalizer = (maxChars = Infinity) => useMemo(() => createInputNormalizer(maxChars).normalize, [maxChars]);

export default useInputNormalizer;
