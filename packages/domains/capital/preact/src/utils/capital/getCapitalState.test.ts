import { describe, expect, test, vi } from 'vitest';
import { AuthSession } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { ICapitalState } from '@integration-components/types';
import {
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_CLOSED_GRANTS,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_GRANTS,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_GRANT,
    CAPITAL_STATE_UNSUPPORTED_REGION,
    CAPITAL_STATE_PENDING_GRANT,
} from '../../../../mocks/mock-data/capital';
import { getCapitalState, getEnhancedCapitalState } from './getCapitalState';

const createSession = (response: ICapitalState | undefined, shouldReject = false) => {
    const endpoint = shouldReject ? vi.fn().mockRejectedValue(new Error('Request failed')) : vi.fn().mockResolvedValue(response);
    return {
        endpoint,
        session: {
            context: {
                endpoints: { getCapitalState: endpoint },
                isExpired: false,
                refreshing: false,
            },
            refresh: vi.fn(),
            subscribe: vi.fn((callback: (value: unknown) => void) => {
                callback({});
                return vi.fn();
            }),
        } as unknown as AuthSession,
    };
};

describe('getEnhancedCapitalState', () => {
    test('returns defaults when no capital state is available', () => {
        expect(getEnhancedCapitalState(undefined)).toEqual({
            dynamicOffer: undefined,
            hasGrants: false,
            isRegionSupported: false,
            region: undefined,
            renewableGrants: [],
            renewsGrantIds: new Set(),
        });
    });

    test('returns dynamic offer when there are no ongoing grants or there is a valid renewal', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_INELIGIBLE)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER)).toMatchObject({ dynamicOffer: CAPITAL_STATE_FIRST_OFFER.dynamicOffer });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_GRANT)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT)).toMatchObject({ dynamicOffer: undefined });
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT)).toMatchObject({ dynamicOffer: CAPITAL_STATE_RENEWABLE_GRANT.dynamicOffer });
        expect(getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS)).toMatchObject({ dynamicOffer: CAPITAL_STATE_CLOSED_GRANTS.dynamicOffer });
    });

    test('identifies ongoing and closed grants', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_FIRST_OFFER)).toMatchObject({ hasGrants: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_PENDING_GRANT)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_CLOSED_GRANTS)).toMatchObject({ hasGrants: true });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS)).toMatchObject({ hasGrants: true });
    });

    test('identifies whether the legal entity region is supported', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION)).toMatchObject({ isRegionSupported: false });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS)).toMatchObject({ isRegionSupported: true });
    });

    test('returns the legal entity region', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION)).toMatchObject({
            region: CAPITAL_STATE_UNSUPPORTED_REGION.legalEntity?.region,
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS)).toMatchObject({
            region: CAPITAL_STATE_GRANTS.legalEntity?.region,
        });
    });

    test('returns grants eligible for renewal', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_RENEWABLE_GRANT)).toMatchObject({
            renewableGrants: [CAPITAL_STATE_RENEWABLE_GRANT.activeOrPendingGrants[0]],
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT)).toMatchObject({ renewableGrants: [] });
    });

    test('identifies grants that are already being renewed', () => {
        expect(getEnhancedCapitalState(CAPITAL_STATE_GRANTS)).toMatchObject({
            renewsGrantIds: new Set([CAPITAL_STATE_GRANTS.activeOrPendingGrants[0]!.renewsGrantId]),
        });
        expect(getEnhancedCapitalState(CAPITAL_STATE_ACTIVE_GRANT)).toMatchObject({ renewsGrantIds: new Set() });
    });
});

describe('getCapitalState', () => {
    const expectCapitalState = async (response: ICapitalState, expectedState: Awaited<ReturnType<typeof getCapitalState>>) => {
        const { endpoint, session } = createSession(response);
        await expect(getCapitalState(session)).resolves.toEqual(expectedState);
        expect(endpoint).toHaveBeenCalledWith(EMPTY_OBJECT, { query: EMPTY_OBJECT });
    };

    test('returns unsupported region state for an unsupported region', async () => {
        await expectCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isInUnsupportedRegion',
        });
    });

    test('returns unqualified state for an ineligible merchant', async () => {
        await expectCapitalState(CAPITAL_STATE_INELIGIBLE, {
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isUnqualified',
        });
    });

    test('returns prequalified state for a first offer', async () => {
        await expectCapitalState(CAPITAL_STATE_FIRST_OFFER, {
            hasGrants: false,
            hasOffer: true,
            hasRenewableGrants: false,
            state: 'isPreQualified',
        });
    });

    test('returns requested grants state for an active grant', async () => {
        await expectCapitalState(CAPITAL_STATE_ACTIVE_GRANT, {
            hasGrants: true,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'hasRequestedGrants',
        });
    });

    test('returns requested grants state, offer and renewals flags for a renewable grant', async () => {
        await expectCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, {
            hasGrants: true,
            hasOffer: true,
            hasRenewableGrants: true,
            state: 'hasRequestedGrants',
        });
    });

    test('returns unqualified state when the endpoint request fails', async () => {
        const { session } = createSession(undefined, true);
        await expect(getCapitalState(session)).resolves.toEqual({
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isUnqualified',
        });
    });
});
