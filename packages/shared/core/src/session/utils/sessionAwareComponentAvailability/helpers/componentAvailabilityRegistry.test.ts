import { describe, expect, test, vi } from 'vitest';
import type AuthSession from '../../../AuthSession';
import componentAvailabilityRegistry from './componentAvailabilityRegistry';

const createContextWith = (endpoints: Record<string, unknown>): AuthSession['context'] => ({ endpoints }) as unknown as AuthSession['context'];

describe('componentAvailabilityRegistry', () => {
    test.each([
        ['transactions', 'getTransactions'],
        ['transactionDetails', 'getTransaction'],
        ['payouts', 'getPayouts'],
        ['payoutDetails', 'getPayout'],
        ['reports', 'getReports'],
        ['capitalOverview', 'getGrants'],
        ['capitalOffer', 'getDynamicGrantOffer'],
        ['disputes', 'getDisputeList'],
        ['disputesManagement', 'getDisputeDetail'],
        ['paymentLinksOverview', 'getPaymentLinks'],
        ['paymentLinkCreation', 'getPayByLinkConfiguration'],
        ['paymentLinkSettings', 'savePayByLinkSettings'],
        ['paymentLinkDetails', 'getPayByLinkPaymentLinkById'],
    ] as const)('gates %s on its primary %s endpoint', (type, endpoint) => {
        const check = componentAvailabilityRegistry[type];

        expect(check(createContextWith({ [endpoint]: vi.fn() }))).toBe(true);
        expect(check(createContextWith({}))).toBe(false);
    });
});
