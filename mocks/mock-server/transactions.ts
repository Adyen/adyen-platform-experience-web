import { http, HttpResponse, PathParams } from 'msw';
import {
    ITransaction,
    IRefundMode,
    ITransactionExportColumn,
    ITransactionRefundPayload,
    ITransactionRefundResponse,
    ITransactionWithDetails,
    ITransactionRefundStatus,
} from '../../src';
import { COMPLETED_REFUND_STATUSES, DEFAULT_REFUND_STATUSES, DEFAULT_TRANSACTION, FAILED_REFUND_STATUSES, TRANSACTIONS } from '../mock-data';
import { parsePaymentMethodType } from '../../src/components/external/TransactionsOverview/components/utils';
import { clamp, EMPTY_ARRAY, getMappedValue, uuid } from '../../src/utils';
import { compareDates, computeHash, delay, getPaginationLinks } from './utils/utils';
import { endpoints } from '../../endpoints/endpoints';
import Localization from '../../src/core/Localization';

interface _ITransactionTotals {
    expenses: number;
    incomings: number;
}

interface _ITransactionDetailsMetadata {
    deductedAmount?: number;
    refundMode?: IRefundMode;
}

const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';
const TRANSACTIONS_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_TOTALS_CACHE = new Map<string, Map<string, _ITransactionTotals>>();
const TRANSACTIONS_DETAILS_CACHE = new Map<string, ITransactionWithDetails>();
const TRANSACTIONS_REFUND_LOCKED_DEADLINES = new Map<number, Set<string>>();
const TRANSACTIONS_REFUND_LOCKED = new Set<string>();

const KLARNA_OR_PAYPAL = ['klarna', 'paypal'];
const PAYMENT_OR_TRANSFER = ['Payment', 'Transfer'];

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;
const refundActionError = false;

const getTransactionWithAmountDeduction = <T extends ITransaction>(
    transaction: T,
    amountDeduction = 0
): T & Pick<ITransactionWithDetails, 'deductedAmount' | 'originalAmount'> => {
    const { currency, value: originalAmount } = transaction.amount;
    const deductedAmount = Math.max(0, amountDeduction ?? 0);
    const transactionAmount = originalAmount - deductedAmount;

    return {
        ...transaction,
        amount: { currency, value: transactionAmount },
        deductedAmount: { currency, value: deductedAmount },
        originalAmount: { currency, value: originalAmount },
    };
};

const getTransactionMetadata = <T extends ITransaction>(transaction: T) => {
    let refundMode: IRefundMode = 'non_refundable';
    let deductedAmount = 0;

    if (PAYMENT_OR_TRANSFER.includes(transaction?.category)) {
        if (KLARNA_OR_PAYPAL.includes(transaction?.paymentMethod?.type ?? '')) {
            refundMode = 'partially_refundable_with_line_items_required';
            deductedAmount = 350;
        } else {
            const amount = transaction.amount.value;
            const isLargeAmount = amount >= 100000;
            refundMode = isLargeAmount ? 'partially_refundable_any_amount' : 'fully_refundable_only';
            deductedAmount = clamp(0, Math.round(amount * (!transaction.paymentMethod?.lastFourDigits && isLargeAmount ? 0.025 : 0.034)), 10000);
        }
    }

    return { deductedAmount, refundMode } as const;
};

const getPaymentOrTransferWithDetails = <T extends ITransaction>(transaction: T, deductedAmount = 0) => {
    return getMappedValue(transaction.id, TRANSACTIONS_DETAILS_CACHE, () => {
        const tx = getTransactionWithAmountDeduction(transaction, deductedAmount) as unknown as ITransactionWithDetails;
        tx.paymentPspReference = uuid();
        return tx;
    });
};

const enrichTransactionDataWithDetails = <T extends ITransaction>(
    transaction: T,
    metadata = getTransactionMetadata(transaction) as _ITransactionDetailsMetadata
): ITransactionWithDetails => {
    const { currency, value: originalAmount } = transaction.amount;
    const { deductedAmount = 0, refundMode = 'fully_refundable_only' } = metadata;

    let refundStatuses = EMPTY_ARRAY as unknown as ITransactionRefundStatus;
    let refundLocked = TRANSACTIONS_REFUND_LOCKED.has(transaction.id);
    let refundableAmount: number | undefined;

    switch (refundMode) {
        case 'non_refundable':
            refundableAmount = 0;
            refundLocked = false;
            break;
        case 'partially_refundable_any_amount':
        case 'partially_refundable_with_line_items_required':
            if (transaction.id === 'YVBUA4RGV6A14629') {
                refundStatuses = FAILED_REFUND_STATUSES?.map(status => ({ ...status, amount: { value: -117500, currency } }));
            } else if (transaction.id === '254X7TAUWB140HW0') {
                refundStatuses = COMPLETED_REFUND_STATUSES?.map(status => ({ ...status, amount: { ...status.amount, currency } }));
            } else {
                refundStatuses = DEFAULT_REFUND_STATUSES?.map(status => ({ ...status, amount: { ...status.amount, currency } }));
            }
            break;
    }

    let transactionWithDetails = { ...transaction } as unknown as ITransactionWithDetails;

    switch (transaction.category) {
        case 'Payment':
        case 'Transfer': {
            transactionWithDetails = getPaymentOrTransferWithDetails(transaction, deductedAmount)!;
            const refundedAmount = refundStatuses?.reduce((sum, refund) => sum + refund.amount.value, 0) || 0;
            refundableAmount = originalAmount + refundedAmount;
            break;
        }
        case 'Refund': {
            transactionWithDetails = getMappedValue(transaction.id, TRANSACTIONS_DETAILS_CACHE, () => {
                const { value: amount, currency } = transaction.amount;
                let refundType: NonNullable<ITransactionWithDetails['refundMetadata']>['refundType'] = 'partial';
                let paymentTx: ITransaction | undefined = undefined;

                for (const tx of TRANSACTIONS) {
                    if (!PAYMENT_OR_TRANSFER.includes(tx.category)) continue;
                    if (tx.balanceAccountId !== transaction.balanceAccountId) continue;
                    if (tx.amount.currency !== currency) continue;

                    const txAmount = -tx.amount.value;

                    if (txAmount < amount) paymentTx ??= tx;
                    if (txAmount === amount && (paymentTx = tx) && (refundType = 'full')) break;
                }

                if (paymentTx) {
                    const payment = getPaymentOrTransferWithDetails(paymentTx)!;
                    const tx = { ...transactionWithDetails };

                    tx.originalAmount = { ...payment.amount };
                    tx.paymentPspReference = payment.paymentPspReference;
                    tx.refundMetadata = {
                        originalPaymentId: payment.id,
                        refundPspReference: uuid(),
                        refundReason: 'requested_by_customer',
                        refundType,
                    };

                    return tx;
                }
            })!;

            break;
        }
    }

    return {
        ...transactionWithDetails,
        // lineItems: DEFAULT_LINE_ITEMS.map(item => ({ ...item, amountIncludingTax: { ...item.amountIncludingTax, currency } })),
        refundDetails: {
            refundLocked: false,
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
    return HttpResponse.json(enrichTransactionDataWithDetails(matchingMock));
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

const i18n = new Localization().i18n;

const DownloadFields: Record<ITransactionExportColumn, (transaction: ITransaction) => string> = {
    CreatedAt: ({ createdAt }) => `"${createdAt}"`,
    PaymentMethod: ({ paymentMethod, bankAccount }) =>
        (paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits) ?? '',
    Category: ({ category }) => category,
    NetAmount: ({ amount }) => i18n.amount(amount.value, amount.currency, { hideCurrency: false }),
    AmountBeforeDeductions: ({ amount }) => i18n.amount(amount.value, amount.currency, { hideCurrency: false }),
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
            data: transactions.slice(cursor, cursor + limit).map(tx => {
                const { deductedAmount: deduction } = getTransactionMetadata(tx);
                const { deductedAmount, originalAmount, ...transaction } = getTransactionWithAmountDeduction(tx, deduction);
                return transaction;
            }),
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

    http.get(mockEndpoints.downloadTransactions, async ({ request }) => {
        const { transactions } = fetchTransactionsForRequest(request);
        const columnsParam = new URLSearchParams(new URL(request.url).searchParams).getAll('columns');
        const columns = Object.keys(DownloadFields).filter(column => columnsParam.includes(column));

        return new HttpResponse(
            new Blob(
                columns.length
                    ? [
                          `${columns.join(',')}\r\n`,
                          ...transactions
                              .slice(0, 100)
                              .map(
                                  transaction =>
                                      `${columns.map(column => DownloadFields[column as keyof typeof DownloadFields](transaction)).join(',')}\r\n`
                              ),
                      ]
                    : []
            ),
            {
                headers: {
                    'Content-Disposition': `attachment; filename=transactions`,
                    'Content-Type': 'text/csv',
                },
                status: 200,
            }
        );
    }),

    http.get(mockEndpoints.transaction, ({ params }) => fetchTransaction(params)),

    http.post(mockEndpoints.initiateRefund, async ({ request, params }) => {
        try {
            if (refundActionError) return HttpResponse.error();

            const transactionResponse = await fetchTransaction(params);

            if (!transactionResponse.ok) throw await transactionResponse.text();

            const {
                amount,
                // lineItems,
                refundReason,
            } = (await request.json()) as ITransactionRefundPayload;
            const { id: transactionId, refundDetails } = (await transactionResponse.json()) as ITransactionWithDetails;

            const lockDeadline = Date.now() + 2 * 60 * 1000; // 2 minutes
            const deadlineTransactions = getMappedValue(lockDeadline, TRANSACTIONS_REFUND_LOCKED_DEADLINES, () => new Set())!;

            deadlineTransactions.add(transactionId);
            TRANSACTIONS_REFUND_LOCKED.add(transactionId);

            return HttpResponse.json({
                amount,
                ...(refundReason && { refundReason }),
                ...(refundDetails?.refundMode.startsWith('partially_refundable') &&
                    {
                        // lineItems: (lineItems ?? (EMPTY_ARRAY as NonNullable<typeof lineItems>))
                        //     .map(({ reference, quantity }) => {
                        //         const item = DEFAULT_LINE_ITEMS.find(({ reference: _reference }) => reference === _reference);
                        //         if (item) {
                        //             const availableQuantity = Math.max(0, item.availableQuantity - Math.max(0, quantity));
                        //             return { ...item, availableQuantity };
                        //         }
                        //     })
                        //     .filter(Boolean) as NonNullable<ITransactionRefundResponse['lineItems']>,
                    }),
                status: 'received',
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
