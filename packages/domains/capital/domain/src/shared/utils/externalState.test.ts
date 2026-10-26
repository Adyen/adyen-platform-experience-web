import { describe, expect, test, vi } from 'vitest';
import { AuthSession } from '@integration-components/core';
import { EMPTY_OBJECT } from '@integration-components/utils';
import { ICapitalState } from '@integration-components/types';
import localSupportedRegions from '../../config/supportedRegions.json';
import {
    CAPITAL_STATE_ACTIVE_GRANT,
    CAPITAL_STATE_FIRST_OFFER,
    CAPITAL_STATE_GRANTS,
    CAPITAL_STATE_INELIGIBLE,
    CAPITAL_STATE_RENEWABLE_GRANT,
    CAPITAL_STATE_UNSUPPORTED_REGION,
} from '../../../../mocks/mock-data/capital';
import { ExternalCapitalState, getExternalCapitalState } from './externalState';

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
    const expectCapitalState = async (response: ICapitalState, expectedState: Awaited<Partial<ExternalCapitalState>>) => {
        const { endpoint, session } = createSession(response);
        const getCdnConfig = vi.fn().mockResolvedValue(localSupportedRegions);

        await expect(getExternalCapitalState(session, getCdnConfig)).resolves.toMatchObject(expectedState);
        expect(endpoint).toHaveBeenCalledWith(EMPTY_OBJECT, { query: EMPTY_OBJECT });
        expect(getCdnConfig).toHaveBeenCalledWith({
            subFolder: 'capital',
            name: 'supportedRegions',
            fallback: localSupportedRegions,
        });
    };

    test('indicates is the state is available', async () => {
        const { session } = createSession(undefined, true);
        await expect(getExternalCapitalState(session)).resolves.toEqual({ isAvailable: false });
        await expectCapitalState(CAPITAL_STATE_GRANTS, {
            isRegionSupported: true,
        });
    });

    test('indicates if the region is supported', async () => {
        await expectCapitalState(CAPITAL_STATE_UNSUPPORTED_REGION, {
            isRegionSupported: false,
        });
        await expectCapitalState(CAPITAL_STATE_GRANTS, {
            isRegionSupported: true,
        });
    });

    test('indicates if there is an available offer and if so returns the currency, min and max offer amount', async () => {
        await expectCapitalState(CAPITAL_STATE_INELIGIBLE, {
            dynamicOfferConfig: undefined,
        });
        await expectCapitalState(CAPITAL_STATE_FIRST_OFFER, {
            dynamicOfferConfig: { minAmount: 100000, maxAmount: 2500000, currency: 'EUR' },
        });
    });

    test('indicates if there are grants', async () => {
        await expectCapitalState(CAPITAL_STATE_FIRST_OFFER, {
            hasGrants: false,
        });
        await expectCapitalState(CAPITAL_STATE_ACTIVE_GRANT, {
            hasGrants: true,
        });
    });

    test('indicates if early renewal is available', async () => {
        await expectCapitalState(CAPITAL_STATE_ACTIVE_GRANT, {
            hasRenewableGrants: false,
        });
        await expectCapitalState(CAPITAL_STATE_RENEWABLE_GRANT, {
            hasRenewableGrants: true,
        });
    });
});
