import { describe, expect, test, vi } from 'vitest';
import { AuthSession } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { ICapitalState } from '@integration-components/types';
import localSupportedRegions from '../config/supportedRegions.json';
import {
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_GRANT,
    CAPITAL_STATE_UNSUPPORTED_REGION,
} from '../../../mocks/mock-data/capital';
import { getExternalCapitalState } from './externalState';

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

describe('getExternalCapitalState', () => {
    const expectCapitalState = async (response: ICapitalState, expectedState: Awaited<ReturnType<typeof getExternalCapitalState>>) => {
        const { endpoint, session } = createSession(response);
        const getCdnConfig = vi.fn().mockResolvedValue(localSupportedRegions);

        await expect(getExternalCapitalState(session, getCdnConfig)).resolves.toEqual(expectedState);
        expect(endpoint).toHaveBeenCalledWith(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'supportedRegions',
            fallback: localSupportedRegions,
        });
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

    test('returns unqualified state when capital state endpoint request fails', async () => {
        const { session } = createSession(undefined, true);
        await expect(getExternalCapitalState(session)).resolves.toEqual({
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isUnqualified',
        });
    });

    test('returns unqualified state when the capital state endpoint is unavailable', async () => {
        const session = {
            context: {
                endpoints: {},
                isExpired: false,
                refreshing: false,
            },
            refresh: vi.fn(),
            subscribe: vi.fn((callback: (value: unknown) => void) => {
                callback({});
                return vi.fn();
            }),
        } as unknown as AuthSession;

        await expect(getExternalCapitalState(session)).resolves.toEqual({
            hasGrants: false,
            hasOffer: false,
            hasRenewableGrants: false,
            state: 'isUnqualified',
        });
    });
});
