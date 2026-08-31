import { describe, expect, test, vi } from 'vitest';
import { ACCOUNT_MISCONFIGURATION, WRONG_STORE_IDS } from '@integration-components/payByLink/domain';
import { createPaymentLinksError } from './error';
import { getPaymentLinksErrorMessage } from './getPaymentLinksErrorMessage';

const ERROR_MESSAGE = 'payByLink.overview.errors.couldNotLoadLinks' as const;

describe('getPaymentLinksErrorMessage', () => {
    test.each([
        [ACCOUNT_MISCONFIGURATION, ['payByLink.common.errors.accountConfiguration', 'payByLink.errors.contactSupport']],
        [WRONG_STORE_IDS, ['payByLink.common.errors.storeID', 'payByLink.errors.contactSupport']],
    ])('maps the %s synthetic store error', (errorCode, messages) => {
        const onContactSupport = vi.fn();
        const content = getPaymentLinksErrorMessage(createPaymentLinksError('Store error', { errorCode }), ERROR_MESSAGE, onContactSupport);

        expect(content).toMatchObject({
            title: 'payByLink.errors.somethingWentWrong',
            messages,
            imageName: 'wrong-environment',
            onContactSupport,
        });
    });

    test('maps an invalid payment link ID to the no-results state', () => {
        const error = createPaymentLinksError('Invalid ID', {
            errorCode: '29_001',
            invalidFields: [{ name: 'paymentLinkId' }],
        });

        expect(getPaymentLinksErrorMessage(error, ERROR_MESSAGE)).toEqual({
            title: 'payByLink.overview.errors.listEmpty',
            messages: ['payByLink.overview.errors.listEmpty.message'],
            imageName: 'no-results-found',
        });
    });

    test('maps other validation errors to retry guidance', () => {
        const onContactSupport = vi.fn();
        const error = createPaymentLinksError('Invalid fields', {
            errorCode: '29_001',
            invalidFields: [{ name: 'storeIds' }],
        });

        expect(getPaymentLinksErrorMessage(error, ERROR_MESSAGE, onContactSupport)).toMatchObject({
            messages: ['payByLink.overview.errors.couldNotLoadLinks', 'payByLink.errors.retry'],
            onContactSupport,
        });
    });

    test.each(['00_500', undefined])('maps the %s error code to refresh guidance', errorCode => {
        const error = createPaymentLinksError('Server error', {
            errorCode,
            requestId: 'request-id',
        });

        expect(getPaymentLinksErrorMessage(error, ERROR_MESSAGE)).toMatchObject({
            messages: ['payByLink.overview.errors.couldNotLoadLinks', 'payByLink.errors.errorCodeSupport'],
            requestId: 'request-id',
            refreshComponent: true,
        });
    });

    test('maps unknown errors to the configured message and contact-support action', () => {
        const onContactSupport = vi.fn();
        const error = createPaymentLinksError('Unknown error', {
            errorCode: 'unknown',
            requestId: 'request-id',
        });

        expect(getPaymentLinksErrorMessage(error, ERROR_MESSAGE, onContactSupport)).toMatchObject({
            messages: [ERROR_MESSAGE, 'payByLink.errors.errorCode'],
            requestId: 'request-id',
            onContactSupport,
            refreshComponent: true,
        });
    });
});
