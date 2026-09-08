import { describe, expect, test } from 'vitest';
import { getPaymentLinkErrorMessageContent } from './getPaymentLinkErrorMessageContent';

describe('getPaymentLinkErrorMessageContent', () => {
    test('returns V2 domain keys for generic errors', () => {
        expect(getPaymentLinkErrorMessageContent(undefined, 'payByLink.details.errors.unavailable', false)).toEqual({
            title: 'payByLink.common.errors.unexpected',
            messages: ['payByLink.common.errors.contactSupport'],
        });
    });

    test('returns the domain retry key for network errors', () => {
        expect(getPaymentLinkErrorMessageContent({}, 'payByLink.details.errors.unavailable', false)).toEqual({
            title: 'payByLink.common.errors.somethingWentWrong',
            messages: ['payByLink.details.errors.unavailable', 'payByLink.common.errors.retry'],
            refreshComponent: true,
        });
    });
});
