import { describe, expect, test, vi } from 'vitest';
import Localization from '@integration-components/core/Localization';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS } from '@integration-components/utils';
import { PAYMENT_LINKS } from '../../../mocks/mock-data/payByLink';
import { buildPaymentLinkListItems, getPaymentLinkErrorMessageContent } from './utils';

describe('buildPaymentLinkListItems', () => {
    test('formats creation and expiration timestamps with the details format', () => {
        const paymentLink = PAYMENT_LINKS[0];
        if (!paymentLink) throw new Error('Missing payment link fixture');

        const dateFormat = vi.fn(() => 'formatted date');
        const i18n = new Localization().i18n;
        buildPaymentLinkListItems(paymentLink, {
            i18n,
            dateFormat,
        });

        expect(dateFormat).toHaveBeenNthCalledWith(1, paymentLink.linkInformation.creationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS);
        expect(dateFormat).toHaveBeenNthCalledWith(2, paymentLink.linkInformation.expirationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS);
    });
});

describe('getPaymentLinkErrorMessageContent', () => {
    test('returns V2 domain keys for generic errors', () => {
        expect(getPaymentLinkErrorMessageContent(undefined, 'payByLink.details.errors.unavailable', false)).toEqual({
            title: 'payByLink.common.errors.unexpected',
            message: ['payByLink.common.errors.contactSupport'],
        });
    });

    test('returns the domain retry key for network errors', () => {
        expect(getPaymentLinkErrorMessageContent({}, 'payByLink.details.errors.unavailable', false)).toEqual({
            title: 'payByLink.common.errors.somethingWentWrong',
            message: ['payByLink.details.errors.unavailable', 'payByLink.common.errors.retry'],
            refreshComponent: true,
        });
    });
});
