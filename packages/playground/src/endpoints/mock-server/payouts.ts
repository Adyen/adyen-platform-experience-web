import { rest } from 'msw';
import { PAYOUTS, PAYOUTS_WITH_DETAILS, TRANSACTIONS } from '@adyen/adyen-platform-experience-web-mocks';
import { endpoints } from '../endpoints';
import { delay } from '../utils/utils';

const mockEndpoints = endpoints('mock');
const networkError = false;

export const payoutsMocks = [
    rest.get(mockEndpoints.payouts, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const balanceAccountId = req.url.searchParams.get('balanceAccountId');
        const createdSince = req.url.searchParams.get('createdSince');
        const createdUntil = req.url.searchParams.get('createdUntil');

        let payouts = PAYOUTS;
        let responseDelay = 200;

        if (balanceAccountId || createdSince || createdUntil) {
            payouts = payouts.filter(
                payout =>
                    (!balanceAccountId || payout.balanceAccountId === balanceAccountId) &&
                    (!createdSince || compareDates(payout.createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(payout.createdAt, createdUntil, 'le'))
            );
            responseDelay = 400;
        }

        return res(delay(responseDelay), ctx.json({ data: payouts }));
    }),

    rest.get(mockEndpoints.payout, (req, res, ctx) => {
        if (networkError) {
            return res.networkError('Failed to connect');
        }

        const matchingMock = PAYOUTS_WITH_DETAILS.find(mock => mock.payout.id === req.params.id);

        if (!matchingMock) {
            res(ctx.status(404), ctx.text('Cannot find matching Payout'));
            return;
        }

        return res(ctx.json(matchingMock));
    }),
];

const compareDates = (dateString1: string, dateString2: string, operator: 'ge' | 'le') => {
    let date1 = new Date(dateString1);
    let date2 = new Date(dateString2);

    console.log(date1, date2);

    switch (operator) {
        case 'ge':
            return date1 >= date2;
        case 'le':
            return date1 <= date2;
    }
};
