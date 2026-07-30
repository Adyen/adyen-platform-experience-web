import { boolOrFalse, enumerable, identity, struct } from '@integration-components/utils';

export const BLACKLISTED_CHARS = /[\f\n\r\t\v\u180e\u200b-\u200d\u2060\ufeff]+|[^\s\w-/+(@:&|#)%.,']/g;

export interface InputNormalizer {
    readonly normalize: (input: string, extensiveNormalization?: boolean) => string;
}

export const assertInteger = (value: number, subject = 'value') => {
    if (!Number.isInteger(value)) throw new TypeError(`${subject.trim()} must be an integer`);
};

export const assertPositive = (value: number, subject = 'value') => {
    if (value < 0) throw new TypeError(`${subject.trim()} cannot be negative`);
};

export const createInputNormalizer = (maxChars = Infinity) => {
    type _TruncateString = (value: string, maxlength?: number) => string;

    if (maxChars !== Infinity) {
        const subject = 'Character limit';
        assertInteger(maxChars, subject);
        assertPositive(maxChars, subject);
    }

    const _extensiveNormalize = (input: string) => {
        const substringChars = maxChars === Infinity ? input.length : maxChars;
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
