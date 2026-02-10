import { http, HttpResponse } from 'msw';
import { BALANCE_ACCOUNTS_SINGLE, PAYOUTS_WITH_DETAILS } from '../mock-data';
import { compareDates, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import type { IPayout, IPayoutDetails } from '../../src';

const mockEndpoints = endpoints();
const networkError = false;
const defaultPaginationLimit = 20;
const DEFAULT_SORT_DIRECTION = 'desc';

const getPayouts = (balanceAccountId: string) => {
    // prettier-ignore
    return PAYOUTS_WITH_DETAILS
        .filter(payout => balanceAccountId === payout.balanceAccountId)
        .map(payout => payout.payout as IPayout);
};

export const payoutsMocks = [
    http.get(mockEndpoints.payouts, async ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);

        const balanceAccountId = url.searchParams.get('balanceAccountId');
        const createdSince = url.searchParams.get('createdSince');
        const createdUntil = url.searchParams.get('createdUntil');
        const sortDirection = url.searchParams.get('sortDirection') ?? DEFAULT_SORT_DIRECTION;
        const limit = +(url.searchParams.get('limit') ?? defaultPaginationLimit);
        const cursor = +(url.searchParams.get('cursor') ?? 0);

        let payouts = balanceAccountId ? getPayouts(balanceAccountId) : [];
        let responseDelay = 200;

        if (balanceAccountId || createdSince || createdUntil) {
            const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

            payouts = payouts
                .filter(
                    payout =>
                        (!createdSince || compareDates(payout.createdAt, createdSince, 'ge')) &&
                        (!createdUntil || compareDates(payout.createdAt, createdUntil, 'le'))
                )
                .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);

            responseDelay = 400;
        }

        const data = payouts.slice(cursor, cursor + limit);

        await delay(responseDelay);
        return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, payouts.length) });
    }),

    http.get(mockEndpoints.payout, ({ request }) => {
        if (networkError) {
            return HttpResponse.error();
        }
        const url = new URL(request.url);
        const matchingMock = PAYOUTS_WITH_DETAILS.find(
            mock => mock.balanceAccountId === url.searchParams.get('balanceAccountId') && mock.payout?.createdAt === url.searchParams.get('createdAt')
        );

        if (!matchingMock) {
            HttpResponse.text('Cannot find matching Payout', { status: 404 });
            return;
        }

        return HttpResponse.json(matchingMock);
    }),
];

export const PAYOUT_DETAILS_HANDLERS = (() => {
    const basePayoutDetails = PAYOUTS_WITH_DETAILS[0]!;
    const { isSumOfSameDayPayouts, ...basePayout } = basePayoutDetails.payout!;
    const DEFAULT_PAYOUT_DETAILS = { ...basePayoutDetails, payout: basePayout } satisfies IPayoutDetails & { balanceAccountId: string };

    return {
        default: {
            handlers: [
                http.get(mockEndpoints.payout, () => {
                    return HttpResponse.json(DEFAULT_PAYOUT_DETAILS);
                }),
            ],
        },
        errorDetails: {
            handlers: [
                http.get(mockEndpoints.payout, () => {
                    return HttpResponse.error();
                }),
            ],
        },
        sumOfSameDayPayouts: {
            handlers: [
                http.get(mockEndpoints.payout, () => {
                    const payoutDetails = DEFAULT_PAYOUT_DETAILS;
                    return HttpResponse.json({ ...payoutDetails, payout: { ...payoutDetails.payout, isSumOfSameDayPayouts: true } });
                }),
            ],
        },
    };
})();

export const PAYOUTS_OVERVIEW_HANDLERS = {
    singleBalanceAccount: {
        handlers: [
            http.get(mockEndpoints.balanceAccounts, () => {
                return HttpResponse.json({ data: BALANCE_ACCOUNTS_SINGLE });
            }),
        ],
    },
    emptyList: {
        handlers: [
            http.get(mockEndpoints.payouts, () => {
                return HttpResponse.json({ data: [], _links: {} });
            }),
        ],
    },
    errorList: {
        handlers: [
            http.get(mockEndpoints.payouts, () => {
                return HttpResponse.error();
            }),
        ],
    },
};
