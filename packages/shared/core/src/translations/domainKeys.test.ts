import { describe, expect, test } from 'vitest';
import { getSafeDomainTranslationKey, getUnsafeDomainTranslationKey, type TranslationDomain } from './index';

/** Stands in for the domain a shared component reads from `useCoreContext`: known only at runtime. */
const ambientDomain = 'disputes' as TranslationDomain;

/**
 * Compile-time assertions, never invoked. If the guard stops rejecting any of these, `types:check`
 * fails on the unused `@ts-expect-error` directive. These are the compositions that would otherwise
 * reach the UI as raw key text, because `i18n.get` returns the key when it is missing.
 */
const rejectedCompositions = () => {
    // @ts-expect-error - capital defines no `common.errors.unexpected`
    getSafeDomainTranslationKey(ambientDomain, 'common.errors.unexpected');

    // @ts-expect-error - capital is the one domain without it
    getSafeDomainTranslationKey('capital', 'common.errors.notFound');

    // @ts-expect-error - misspelled leaf
    getSafeDomainTranslationKey(ambientDomain, 'common.actions.copy.labels.doen');

    // @ts-expect-error - not statically known, so it belongs to the unsafe builder
    getSafeDomainTranslationKey(ambientDomain, String(Date.now()));
};

describe('getSafeDomainTranslationKey', () => {
    test('composes the absolute key', () => {
        expect(getSafeDomainTranslationKey('disputes', 'common.errors.unexpected')).toBe('disputes.common.errors.unexpected');
        expect(getSafeDomainTranslationKey('capital', 'common.actions.copy.labels.done')).toBe('capital.common.actions.copy.labels.done');
    });

    test('accepts a key defined by every domain, whichever one is mounted', () => {
        expect(getSafeDomainTranslationKey(ambientDomain, 'common.actions.copy.labels.done')).toBe('disputes.common.actions.copy.labels.done');
        expect(getSafeDomainTranslationKey(ambientDomain, 'common.errors.somethingWentWrong')).toBe('disputes.common.errors.somethingWentWrong');
    });

    test('checks only the domain it is given', () => {
        expect(getSafeDomainTranslationKey('disputes', 'common.errors.notFound')).toBe('disputes.common.errors.notFound');
    });

    test('rejects compositions that cannot be proven to exist', () => {
        expect(rejectedCompositions).toBeTypeOf('function');
    });
});

describe('getUnsafeDomainTranslationKey', () => {
    test('composes a key that is only known at runtime', () => {
        expect(getUnsafeDomainTranslationKey('capital', String('common.errors.notFound'))).toBe('capital.common.errors.notFound');
    });
});
