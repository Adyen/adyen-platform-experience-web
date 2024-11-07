import { http, HttpResponse, PathParams } from 'msw';
import { ITransaction, ITransactionRefundPayload, ITransactionRefundResponse, ITransactionWithDetails } from '../../src';
import { DEFAULT_LINE_ITEMS, DEFAULT_REFUND_STATUSES, DEFAULT_TRANSACTION, TRANSACTIONS } from '../mock-data';
import { clamp, EMPTY_ARRAY, EMPTY_OBJECT, getMappedValue, isUndefined } from '../../src/utils';
import { compareDates, computeHash, delay, getPaginationLinks } from './utils';
import { endpoints } from '../../endpoints/endpoints';

interface _ITransactionTotals {
    expenses: number;
    incomings: number;
}

const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';
const TRANSACTIONS_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_TOTALS_CACHE = new Map<string, Map<string, _ITransactionTotals>>();
const TRANSACTIONS_REFUND_LOCKED_DEADLINES = new Map<number, Set<string>>();
const TRANSACTIONS_REFUND_LOCKED = new Set<string>();

const KLARNA_OR_PAYPAL = ['klarna', 'paypal'];
const PAYMENT_OR_TRANSFER = ['Payment', 'Transfer'];

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;

const amountWithCurrency = (amount: ITransaction['amount'], currency = amount.currency): ITransaction['amount'] => ({ ...amount, currency });

const enrichTransactionDataWithDetails = (
    transaction: ITransaction,
    { deductedAmount: _deductedAmount, lineItemsSlice, refundMode = 'fully_refundable_only' } = EMPTY_OBJECT as {
        deductedAmount?: number;
        lineItemsSlice?: [sliceStart: number, sliceEnd?: number];
        refundMode?: ITransactionWithDetails['refundDetails']['refundMode'];
    }
): ITransactionWithDetails => {
    const { currency, value: transactionAmount } = transaction.amount;
    const deductedAmount = Math.max(0, _deductedAmount ?? 0);
    const originalAmount = transactionAmount + deductedAmount;

    let lineItems = EMPTY_ARRAY as unknown as ITransactionWithDetails['lineItems'];
    let refundStatuses = EMPTY_ARRAY as unknown as ITransactionWithDetails['refundDetails']['refundStatuses'];
    let refundLocked = TRANSACTIONS_REFUND_LOCKED.has(transaction.id);
    let refundableAmount: number | undefined;

    if (refundMode === 'partially_refundable_with_line_items_required') {
        if (isUndefined(lineItemsSlice)) lineItemsSlice = [0];
    }

    switch (refundMode) {
        case 'non_refundable':
            refundableAmount = 0;
            refundLocked = false;
            break;
        case 'partially_refundable_any_amount':
        case 'partially_refundable_with_line_items_required':
            refundStatuses = DEFAULT_REFUND_STATUSES.map(({ amount, ...restStatusData }) => ({
                ...restStatusData,
                amount: amountWithCurrency(amount, currency),
            }));

            if (lineItemsSlice) {
                lineItems = DEFAULT_LINE_ITEMS.slice(...lineItemsSlice).map(({ amountIncludingTax, ...restItemData }) => ({
                    ...restItemData,
                    amountIncludingTax: amountWithCurrency(amountIncludingTax, currency),
                }));
            }

            break;
    }

    return {
        ...transaction,
        lineItems,
        originalAmount: { currency, value: originalAmount },
        deductedAmount: { currency, value: deductedAmount },
        refundDetails: {
            refundLocked,
            refundMode,
            refundStatuses,
            refundableAmount: { currency, value: refundableAmount ?? originalAmount },
        },
    };
};

const fetchTransaction = async (params: PathParams) => {
    const matchingMock = [...TRANSACTIONS, DEFAULT_TRANSACTION].find(mock => mock.id === params.id);

    if (!matchingMock) return HttpResponse.text('Cannot find matching Transaction mock', { status: 404 });

    await delay(1000);
    passThroughRefundLockDeadlineCheckpoint();

    if (PAYMENT_OR_TRANSFER.includes(matchingMock.category)) {
        if (KLARNA_OR_PAYPAL.includes(matchingMock.paymentMethod?.type!)) {
            return HttpResponse.json(
                enrichTransactionDataWithDetails(matchingMock, {
                    deductedAmount: 350,
                    refundMode: 'partially_refundable_with_line_items_required',
                })
            );
        }

        const amount = matchingMock.amount.value;
        const isLargeAmount = amount >= 100000;

        return HttpResponse.json(
            enrichTransactionDataWithDetails(matchingMock, {
                deductedAmount: clamp(0, Math.round(amount * (!matchingMock.paymentMethod?.lastFourDigits && isLargeAmount ? 0.025 : 0.034)), 10000),
                refundMode: isLargeAmount ? 'partially_refundable_any_amount' : 'fully_refundable_only',
            })
        );
    }

    return HttpResponse.json(enrichTransactionDataWithDetails(matchingMock, { refundMode: 'non_refundable' }));
};

const fetchTransactionsForRequest = (req: Request) => {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const balanceAccount = searchParams.get('balanceAccountId');
    const categories = searchParams.getAll('categories');
    const createdSince = searchParams.get('createdSince');
    const createdUntil = searchParams.get('createdUntil');
    const currencies = searchParams.getAll('currencies');
    const maxAmount = searchParams.get('maxAmount');
    const minAmount = searchParams.get('minAmount');
    const sortDirection = searchParams.get('sortDirection') ?? DEFAULT_SORT_DIRECTION;
    const statuses = searchParams.getAll('statuses');

    const hash = computeHash(
        [balanceAccount, String(categories), createdSince, createdUntil, String(currencies), maxAmount, minAmount, sortDirection, String(statuses)]
            .filter(Boolean)
            .join(':')
    );

    let transactions = TRANSACTIONS_CACHE.get(hash);

    if (transactions === undefined) {
        const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

        transactions = [...TRANSACTIONS]
            .filter(
                ({ amount, balanceAccountId, category, createdAt, status }) =>
                    balanceAccount &&
                    balanceAccount === balanceAccountId &&
                    (!categories.length || categories.includes(category)) &&
                    (!createdSince || compareDates(createdAt, createdSince, 'ge')) &&
                    (!createdUntil || compareDates(createdAt, createdUntil, 'le')) &&
                    (!currencies.length || currencies.includes(amount.currency)) &&
                    (maxAmount === null || amount.value * 1000 <= Number(maxAmount)) &&
                    (minAmount === null || amount.value * 1000 >= Number(minAmount)) &&
                    (!statuses.length || statuses!.includes(status))
            )
            .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);

        TRANSACTIONS_CACHE.set(hash, transactions);
    }

    return { hash, transactions } as const;
};

const passThroughRefundLockDeadlineCheckpoint = () => {
    for (const [deadline, transactions] of TRANSACTIONS_REFUND_LOCKED_DEADLINES) {
        if (deadline > Date.now()) return;
        transactions.forEach(tx => TRANSACTIONS_REFUND_LOCKED.delete(tx));
        TRANSACTIONS_REFUND_LOCKED_DEADLINES.delete(deadline);
    }
};

export const transactionsMocks = [
    http.get(mockEndpoints.transactions, async ({ request }) => {
        if (networkError) return HttpResponse.error();

        if (serverError) {
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
        }

        const url = new URL(request.url);
        const cursor = +(url.searchParams.get('cursor') ?? 0);
        const limit = +(url.searchParams.get('limit') ?? DEFAULT_PAGINATION_LIMIT);
        const responseDelay = 200 + Math.round(Math.floor(Math.random() * 201) / 50) * 50;

        const { transactions } = fetchTransactionsForRequest(request);

        await delay(responseDelay);

        return HttpResponse.json({
            data: transactions.slice(cursor, cursor + limit),
            _links: getPaginationLinks(cursor, limit, transactions.length),
        });
    }),

    http.get(mockEndpoints.transactionsTotals, ({ request }) => {
        const url = new URL(request.url);
        const searchParams = url.searchParams;

        // Don't filter transactions within the same time window
        searchParams.delete('categories');
        searchParams.delete('currencies');
        searchParams.delete('maxAmount');
        searchParams.delete('minAmount');
        searchParams.delete('sortDirection');
        searchParams.delete('statuses');

        const { hash, transactions } = fetchTransactionsForRequest(request);
        let totals = TRANSACTIONS_TOTALS_CACHE.get(hash);

        if (totals === undefined) {
            totals = transactions.reduce((currencyTotalsMap, transaction) => {
                const { value: amount, currency } = transaction.amount;
                let currencyTotals = currencyTotalsMap.get(currency);

                if (currencyTotals === undefined) {
                    currencyTotalsMap.set(currency, (currencyTotals = { expenses: 0, incomings: 0 }));
                }

                currencyTotals[amount >= 0 ? 'incomings' : 'expenses'] += amount;
                return currencyTotalsMap;
            }, new Map<string, _ITransactionTotals>());

            TRANSACTIONS_TOTALS_CACHE.set(hash, totals);
        }

        const data: (_ITransactionTotals & { currency: string })[] = [];

        for (const [currency, currencyTotals] of totals) {
            data.push({ currency, ...currencyTotals });
        }

        return HttpResponse.json({ data });
    }),

    http.get(mockEndpoints.transaction, ({ params }) => fetchTransaction(params)),

    http.post(mockEndpoints.refundTransaction, async ({ request, params }) => {
        try {
            const transactionResponse = await fetchTransaction(params);

            if (!transactionResponse.ok) throw await transactionResponse.text();

            const { amount, lineItems, merchantRefundReason, reference } = (await request.json()) as ITransactionRefundPayload;
            const { id: transactionId, refundDetails } = (await transactionResponse.json()) as ITransactionWithDetails;

            const lockDeadline = Date.now() + 2 * 60 * 1000; // 2 minutes
            const deadlineTransactions = getMappedValue(lockDeadline, TRANSACTIONS_REFUND_LOCKED_DEADLINES, () => new Set())!;

            deadlineTransactions.add(transactionId);
            TRANSACTIONS_REFUND_LOCKED.add(transactionId);

            return HttpResponse.json({
                amount,
                ...(merchantRefundReason && { merchantRefundReason }),
                ...(reference && { reference }),
                ...(refundDetails.refundMode.startsWith('partially_refundable') && {
                    lineItems: (lineItems ?? (EMPTY_ARRAY as NonNullable<typeof lineItems>)).map(({ item, quantity }) => {
                        const availableQuantity = Math.max(0, item.availableQuantity - Math.max(0, quantity));
                        return { ...item, availableQuantity };
                    }),
                }),
                status: 'received',
                transactionId,
            } satisfies ITransactionRefundResponse);
        } catch {
            return HttpResponse.json(
                {
                    type: 'https://docs.adyen.com/errors/forbidden',
                    errorCode: '00_500',
                    title: 'Forbidden',
                    detail: 'Cannot process refund for this transaction',
                    requestId: '769ac4ce59f0f159ad672d38d3291e91',
                    status: 500,
                },
                { status: 500 }
            );
        }
    }),
];
