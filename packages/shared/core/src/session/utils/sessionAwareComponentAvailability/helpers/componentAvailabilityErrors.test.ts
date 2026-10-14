import { describe, expect, test } from 'vitest';
import componentAvailabilityErrors, {
    getComponentAvailabilityErrorMessages,
    getComponentAvailabilityErrorTitle,
} from './componentAvailabilityErrors';

describe('componentAvailabilityErrors', () => {
    test('maps component types to their domain-specific unavailable message', () => {
        expect(componentAvailabilityErrors('transactions', 'transactions.common.errors.componentUnavailable')).toBe(
            'transactions.overview.errors.unavailable'
        );
        expect(componentAvailabilityErrors('transactionDetails', 'transactions.common.errors.componentUnavailable')).toBe(
            'transactions.details.errors.unavailable'
        );
        expect(componentAvailabilityErrors('payouts', 'payouts.common.errors.componentUnavailable')).toBe('payouts.overview.errors.unavailable');
        expect(componentAvailabilityErrors('payoutDetails', 'payouts.common.errors.componentUnavailable')).toBe('payouts.details.errors.unavailable');
        expect(componentAvailabilityErrors('reports', 'reports.common.errors.componentUnavailable')).toBe('reports.overview.errors.unavailable');
        expect(componentAvailabilityErrors('disputes', 'disputes.common.errors.componentUnavailable')).toBe(
            'disputes.overview.common.errors.unavailable'
        );
        expect(componentAvailabilityErrors('disputesManagement', 'disputes.common.errors.componentUnavailable')).toBe(
            'disputes.management.common.errors.unavailable'
        );
        expect(componentAvailabilityErrors('paymentLinksOverview', 'payByLink.common.errors.componentUnavailable')).toBe(
            'payByLink.overview.errors.unavailable'
        );
        expect(componentAvailabilityErrors('paymentLinkCreation', 'payByLink.common.errors.componentUnavailable')).toBe(
            'payByLink.creation.errors.unavailable'
        );
        expect(componentAvailabilityErrors('paymentLinkDetails', 'payByLink.common.errors.componentUnavailable')).toBe(
            'payByLink.details.errors.unavailable'
        );
        expect(componentAvailabilityErrors('paymentLinkSettings', 'payByLink.common.errors.componentUnavailable')).toBe(
            'payByLink.settings.errors.unavailable'
        );
        expect(componentAvailabilityErrors('capitalOverview', 'capital.common.errors.componentUnavailable')).toBe(
            'capital.overview.common.errors.unavailable'
        );
        expect(componentAvailabilityErrors('capitalOffer', 'capital.common.errors.componentUnavailable')).toBe(
            'capital.offer.common.errors.unavailable'
        );
    });

    test('falls back to the provided message when the component type is unknown', () => {
        expect(componentAvailabilityErrors(undefined, 'transactions.common.errors.componentUnavailable')).toBe(
            'transactions.common.errors.componentUnavailable'
        );
    });
});

describe('getComponentAvailabilityErrorTitle', () => {
    test('resolves the something-went-wrong title for the domain', () => {
        expect(getComponentAvailabilityErrorTitle('transactions')).toBe('transactions.common.errors.somethingWentWrong');
    });
});

describe('getComponentAvailabilityErrorMessages', () => {
    test('combines the domain-specific unavailable message with the contact support message', () => {
        expect(getComponentAvailabilityErrorMessages('transactions', 'transactions')).toEqual([
            'transactions.overview.errors.unavailable',
            'transactions.common.errors.contactSupport',
        ]);
    });

    test('falls back to the generic unavailable message when the component type is unknown', () => {
        expect(getComponentAvailabilityErrorMessages(undefined, 'capital')).toEqual([
            'capital.common.errors.componentUnavailable',
            'capital.common.errors.contactSupport',
        ]);
    });
});
