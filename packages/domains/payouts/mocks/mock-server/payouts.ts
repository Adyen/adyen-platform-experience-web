import { http, HttpResponse } from 'msw';
import type { IPayout, IPayoutDetails } from '@integration-components/types';
import { withDelay, compareDates, getPaginationLinks } from '@integration-components/testing/msw';
import { BALANCE_ACCOUNTS_SINGLE } from '@integration-components/testing/fixtures';
import { PAYOUTS_WITH_DETAILS } from '../mock-data/payouts';
import { PAYOUTS_ENDPOINTS } from '../endpoints';

const mockEndpoints = PAYOUTS_ENDPOINTS;
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
    http.get(
        mockEndpoints.payouts,
        withDelay(({ request }) => {
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

            if (balanceAccountId || createdSince || createdUntil) {
                const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

                payouts = payouts
                    .filter(
                        payout =>
                            (!createdSince || compareDates(payout.createdAt, createdSince, 'ge')) &&
                            (!createdUntil || compareDates(payout.createdAt, createdUntil, 'le'))
                    )
                    .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);
            }

            const data = payouts.slice(cursor, cursor + limit);

            return HttpResponse.json({ data, _links: getPaginationLinks(cursor, limit, payouts.length) });
        })
    ),

    http.get(
        mockEndpoints.payout,
        withDelay(({ request }) => {
            if (networkError) {
                return HttpResponse.error();
            }
            const url = new URL(request.url);
            const matchingMock = PAYOUTS_WITH_DETAILS.find(
                mock =>
                    mock.balanceAccountId === url.searchParams.get('balanceAccountId') && mock.payout?.createdAt === url.searchParams.get('createdAt')
            );

            if (!matchingMock) {
                HttpResponse.text('Cannot find matching Payout', { status: 404 });
                return;
            }

            return HttpResponse.json(matchingMock);
        })
    ),
];

export const PAYOUT_DETAILS_HANDLERS = (() => {
    const basePayoutDetails = PAYOUTS_WITH_DETAILS[0]!;
    const { isSumOfSameDayPayouts, ...basePayout } = basePayoutDetails.payout!;
    const DEFAULT_PAYOUT_DETAILS = { ...basePayoutDetails, payout: basePayout } satisfies IPayoutDetails & { balanceAccountId: string };

    return {
        default: {
            handlers: [
                http.get(
                    mockEndpoints.payout,
                    withDelay(() => {
                        return HttpResponse.json(DEFAULT_PAYOUT_DETAILS);
                    })
                ),
            ],
        },
        errorDetails: {
            handlers: [
                http.get(
                    mockEndpoints.payout,
                    withDelay(() => {
                        return HttpResponse.error();
                    })
                ),
            ],
        },
        errorNotFound: {
            handlers: [
                http.get(
                    mockEndpoints.payout,
                    withDelay(() => {
                        return HttpResponse.json(
                            {
                                type: 'https://docs.adyen.com/errors/not-found',
                                errorCode: '30_112',
                                title: 'Not Found',
                                detail: 'Payout not found for the specified Account Holder',
                                requestId: '769ac4ce59f0f159ad672d38d3291e91',
                                status: 404,
                            },
                            { status: 404 }
                        );
                    })
                ),
            ],
        },
        sumOfSameDayPayouts: {
            handlers: [
                http.get(
                    mockEndpoints.payout,
                    withDelay(() => {
                        const payoutDetails = DEFAULT_PAYOUT_DETAILS;
                        return HttpResponse.json({ ...payoutDetails, payout: { ...payoutDetails.payout, isSumOfSameDayPayouts: true } });
                    })
                ),
            ],
        },
    };
})();

export const PAYOUTS_OVERVIEW_HANDLERS = {
    singleBalanceAccount: {
        handlers: [
            http.get(
                mockEndpoints.balanceAccounts,
                withDelay(() => {
                    return HttpResponse.json({ data: BALANCE_ACCOUNTS_SINGLE });
                })
            ),
        ],
    },
    emptyList: {
        handlers: [
            http.get(
                mockEndpoints.payouts,
                withDelay(() => {
                    return HttpResponse.json({ data: [], _links: {} });
                })
            ),
        ],
    },
    errorList: {
        handlers: [
            http.get(
                mockEndpoints.payouts,
                withDelay(() => {
                    return HttpResponse.error();
                })
            ),
        ],
    },
    errorListServerError: {
        handlers: [
            http.get(
                mockEndpoints.payouts,
                withDelay(() => {
                    return HttpResponse.json(
                        {
                            type: 'https://docs.adyen.com/errors/forbidden',
                            errorCode: '00_500',
                            title: 'Forbidden',
                            detail: 'Balance Account does not belong to Account Holder',
                            requestId: '769ac4ce59f0f159ad672d38d3291e91',
                            status: 500,
                        },
                        { status: 500 }
                    );
                })
            ),
        ],
    },
};
