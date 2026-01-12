import {
    ITransaction,
    IRefundMode,
    ITransactionExportColumn,
    ITransactionRefundPayload,
    ITransactionRefundResponse,
    ITransactionWithDetails,
    ITransactionRefundStatus,
    ITransactionTotal,
} from '../../src';
import {
    BASE_TRANSACTION,
    COMPLETE_TRANSACTION_DETAILS,
    FULL_REFUND_TRANSACTION,
    FULLY_REFUNDABLE_TRANSACTION,
    FULLY_REFUNDED_TRANSACTION,
    getPspReference,
    ORIGINAL_PAYMENT_ID,
    PARTIAL_REFUND_TRANSACTION,
    PARTIALLY_REFUNDABLE_TRANSACTION,
    PARTIALLY_REFUNDED_TRANSACTION,
    PARTIALLY_REFUNDED_TRANSACTION_WITH_STATUSES,
    REFUND_LOCKED_TRANSACTION,
    TRANSACTIONS,
} from '../mock-data';
import Localization from '../../src/core/Localization';
import { endpoints } from '../../endpoints/endpoints';
import { delay as mswDelay, http, HttpResponse, PathParams } from 'msw';
import { parsePaymentMethodType } from '../../src/components/external/Transactions/TransactionsOverview/components/utils';
import { compareDates, computeHash, delay, getPaginationLinks } from './utils/utils';
import { clamp, getMappedValue } from '../../src/utils';
import { setupBasicResponse } from './setup';

type _ITransactionTotals = Omit<ITransactionTotal, 'currency'>;

interface _ITransactionDetailsMetadata {
    deductedAmount?: number;
    refundMode?: IRefundMode;
}

const DEFAULT_PAGINATION_LIMIT = 10;
const DEFAULT_SORT_DIRECTION = 'desc';
const TRANSACTIONS_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_PERIOD_CACHE = new Map<string, ITransaction[]>();
const TRANSACTIONS_TOTALS_CACHE = new Map<string, Map<string, _ITransactionTotals>>();
const TRANSACTIONS_DETAILS_CACHE = new Map<string, ITransactionWithDetails>();
const TRANSACTIONS_REFUND_LOCKED_DEADLINES = new Map<number, Set<ITransactionWithDetails>>();

const ALL_TRANSACTIONS: ITransactionWithDetails[] = [];
const KLARNA_OR_PAYPAL = ['klarna', 'paypal'];

const mockEndpoints = endpoints('mock');
const networkError = false;
const serverError = false;

const getTransactionWithAmountDeduction = <T extends ITransaction>(transaction: T, amountDeduction = 0): T => {
    const { currency, value: originalAmount } = transaction.amountBeforeDeductions;
    const deductedAmount = Math.max(0, amountDeduction ?? 0);
    const transactionAmount = originalAmount - deductedAmount;

    return {
        ...transaction,
        netAmount: { currency, value: transactionAmount },
    };
};

const getTransactionMetadata = <T extends ITransaction>(transaction: T) => {
    let refundMode: IRefundMode = 'non_refundable';
    let deductedAmount = 0;

    if (transaction?.category === 'Payment') {
        if (KLARNA_OR_PAYPAL.includes(transaction?.paymentMethod?.type ?? '')) {
            refundMode = 'partially_refundable_with_line_items_required';
            deductedAmount = 350;
        } else {
            const amount = transaction.netAmount.value;
            const isLargeAmount = amount >= 100000;
            refundMode = isLargeAmount ? 'partially_refundable_any_amount' : 'fully_refundable_only';
            deductedAmount = clamp(0, Math.round(amount * (!transaction.paymentMethod?.lastFourDigits && isLargeAmount ? 0.025 : 0.034)), 10000);
        }
    }

    return { deductedAmount, refundMode } as const;
};

const enrichTransactionDataWithDetails = <T extends ITransaction>(
    transaction: T,
    metadata = getTransactionMetadata(transaction) as _ITransactionDetailsMetadata
): ITransactionWithDetails => {
    const { currency } = transaction.netAmount;
    const { deductedAmount = 0, refundMode = 'fully_refundable_only' } = metadata;

    let refundStatuses = [] as ITransactionRefundStatus;
    let refundableAmount: number | undefined;

    switch (refundMode) {
        case 'non_refundable':
            refundableAmount = 0;
            break;
    }

    let transactionWithDetails = { ...transaction } as ITransactionWithDetails;

    switch (transaction.category) {
        case 'Payment': {
            transactionWithDetails = getMappedValue(transaction.id, TRANSACTIONS_DETAILS_CACHE, () => {
                const tx = getTransactionWithAmountDeduction(transaction, deductedAmount);
                let { currency, value: originalAmount } = tx.amountBeforeDeductions;
                let deductionsAmount = Math.abs(deductedAmount);

                const index = Number(tx.paymentPspReference?.slice(-3) ?? -1);
                const additions = [];
                const deductions = [];

                if (deductionsAmount > 0) {
                    if (deductionsAmount >= 350) {
                        if (index % 2 === 0 || index % 3 === 1) {
                            const tip = Math.min(150, Math.floor((deductionsAmount * 4) / 1000) * 100);
                            deductions.push({ currency, value: -tip, type: 'tip' });
                            additions.push({ currency, value: tip, type: 'tip' });

                            deductionsAmount -= tip;
                            originalAmount -= tip;
                        }

                        if (index % 7 === 0 || index % 3 === 1) {
                            const surcharge = Math.min(1500, Math.floor(deductionsAmount / 100) * 100);
                            deductions.push({ currency, value: -surcharge, type: 'surcharge' });
                            additions.push({ currency, value: surcharge, type: 'surcharge' });

                            deductionsAmount -= surcharge;
                            originalAmount -= surcharge;
                        }
                    }

                    if (deductionsAmount > 500) {
                        const split = Math.floor((deductionsAmount * 8) / 5000) * 500;
                        deductions.push({ currency, value: -split, type: 'split' });
                        deductionsAmount -= split;
                    }

                    if (deductionsAmount) {
                        deductions.unshift({ currency, value: -deductionsAmount, type: 'fee' });
                    }
                }

                return {
                    ...tx,
                    ...(additions.length > 0 && {
                        originalAmount: { currency, value: originalAmount },
                        additions,
                    }),
                    ...(deductions.length > 0 && { deductions }),
                    events: [
                        {
                            amount: tx.netAmount,
                            createdAt: tx.createdAt,
                            status: 'Received',
                            type: 'Capture',
                        },
                        ...(deductionsAmount
                            ? [
                                  {
                                      amount: { currency, value: deductionsAmount },
                                      createdAt: tx.createdAt,
                                      status: 'Fee',
                                      type: 'Capture',
                                  },
                              ]
                            : []),
                        {
                            amount: tx.netAmount,
                            createdAt: tx.createdAt,
                            status: 'Settled',
                            type: 'Payment',
                        },
                    ],
                } as ITransactionWithDetails;
            })!;

            refundableAmount = transactionWithDetails.netAmount.value;
            break;
        }

        case 'Refund': {
            transactionWithDetails = getMappedValue(transaction.id, TRANSACTIONS_DETAILS_CACHE, () => {
                const { value: amount, currency } = transaction.netAmount;
                let refundType: NonNullable<ITransactionWithDetails['refundMetadata']>['refundType'] = 'partial';
                let paymentTx: ITransactionWithDetails | undefined = undefined;

                for (const tx of ALL_TRANSACTIONS) {
                    if (tx.category !== 'Payment') continue;
                    if (tx.balanceAccountId !== transaction.balanceAccountId) continue;
                    if (tx.netAmount.currency !== currency) continue;

                    const txAmount = -tx.netAmount.value;
                    const refundMode = tx.refundDetails?.refundMode;
                    const completedRefunds = tx.refundDetails?.refundStatuses?.filter(({ status }) => status === 'completed').length ?? 0;

                    const isFullRefund = refundMode === 'fully_refundable_only' && txAmount === amount;
                    const isPartialRefund = refundMode === 'partially_refundable_any_amount' && txAmount < amount && completedRefunds < 10;

                    if (isFullRefund) refundType = 'full';

                    if (isFullRefund || isPartialRefund) {
                        paymentTx = tx;
                        break;
                    }
                }

                if (paymentTx) {
                    const tx = { ...transactionWithDetails };
                    const refundPspReference = getPspReference();

                    tx.paymentPspReference = transaction.paymentPspReference = paymentTx.paymentPspReference;
                    tx.refundMetadata = {
                        originalPaymentId: paymentTx.id,
                        refundReason: 'requested_by_customer',
                        refundPspReference,
                        refundType,
                    };

                    if (paymentTx.refundDetails) {
                        paymentTx.refundDetails.refundStatuses ??= [];

                        if (paymentTx.refundDetails.refundableAmount) {
                            paymentTx.refundDetails.refundableAmount.value += amount;
                        }

                        const refundAmount = { currency, value: amount };
                        const refundStatuses = paymentTx.refundDetails.refundStatuses;
                        const nextInsertPoint = refundStatuses.length;

                        if (Math.round(Math.random()) % 2) {
                            const extraRecords = Math.floor(Math.random() * 2);

                            for (let i = 0; i <= extraRecords; i++) {
                                if (refundType === 'full') {
                                    refundStatuses.push({ amount: refundAmount, status: 'failed' });
                                } else if (paymentTx.refundDetails.refundableAmount) {
                                    const refundableAmount = paymentTx.refundDetails.refundableAmount.value;
                                    const status = Math.round(Math.random()) % 2 ? 'failed' : 'in_progress';
                                    const nextAmount = Math.floor((refundableAmount * Math.random()) / 500) * 500;

                                    if (status === 'in_progress') {
                                        paymentTx.refundDetails.refundableAmount.value -= nextAmount;
                                    }

                                    refundStatuses.push({
                                        amount: { currency, value: -nextAmount },
                                        status,
                                    });
                                }
                            }
                        }

                        const refundEntry: NonNullable<ITransactionRefundStatus>[number] = { amount: refundAmount, status: 'completed' };

                        refundType === 'full' ? refundStatuses.push(refundEntry) : refundStatuses.splice(nextInsertPoint, 0, refundEntry);
                    }

                    return tx;
                }

                return transactionWithDetails;
            })!;

            break;
        }
    }

    return {
        ...transactionWithDetails,
        refundDetails: {
            refundMode,
            refundStatuses,
            refundableAmount: { currency, value: refundableAmount ?? transactionWithDetails.netAmount.value },
            refundLocked: false,
        },
    };
};

const fetchTransaction = async (params: PathParams) => {
    const matchingMock = ALL_TRANSACTIONS.find(mock => mock.id === params.id);
    if (!matchingMock) return HttpResponse.text('Cannot find matching Transaction mock', { status: 404 });

    await delay(1000);
    passThroughRefundLockDeadlineCheckpoint();
    return HttpResponse.json(matchingMock);
};

const fetchTransactionsForRequest = (req: Request) => {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    const balanceAccount = searchParams.get('balanceAccountId');
    const categories = searchParams.getAll('categories');
    const createdSince = searchParams.get('createdSince');
    const createdUntil = searchParams.get('createdUntil');
    const currencies = searchParams.getAll('currencies');
    const sortDirection = searchParams.get('sortDirection') ?? DEFAULT_SORT_DIRECTION;
    const statuses = searchParams.getAll('statuses');
    const pspReferenceValue = searchParams.get('paymentPspReference');

    const hashArray = [
        createdSince,
        createdUntil,
        balanceAccount,
        pspReferenceValue,
        String(categories),
        String(currencies),
        String(statuses),
        sortDirection,
    ];

    const periodHash = computeHash(hashArray.slice(0, 3).filter(Boolean).join(':'));
    const transactionsHash = computeHash(hashArray.filter(Boolean).join(':'));

    let periodTransactions = TRANSACTIONS_PERIOD_CACHE.get(periodHash);
    let transactions = TRANSACTIONS_CACHE.get(transactionsHash);

    if (periodTransactions === undefined) {
        periodTransactions = TRANSACTIONS.filter(
            ({ balanceAccountId, createdAt }) =>
                (!balanceAccount || balanceAccount === balanceAccountId) &&
                (!createdSince || compareDates(createdAt, createdSince, 'ge')) &&
                (!createdUntil || compareDates(createdAt, createdUntil, 'le'))
        );

        TRANSACTIONS_PERIOD_CACHE.set(periodHash, periodTransactions);
    }

    if (transactions === undefined) {
        const direction = sortDirection === DEFAULT_SORT_DIRECTION ? -1 : 1;

        transactions = periodTransactions
            .filter(
                ({ netAmount: amount, category, status, paymentPspReference }) =>
                    (!pspReferenceValue || pspReferenceValue === paymentPspReference) &&
                    (!categories.length || categories.includes(category)) &&
                    (!currencies.length || currencies.includes(amount.currency)) &&
                    (!statuses.length || statuses!.includes(status))
            )
            .sort(({ createdAt: a }, { createdAt: b }) => (+new Date(a) - +new Date(b)) * direction);

        TRANSACTIONS_CACHE.set(transactionsHash, transactions);
    }

    return { periodHash, periodTransactions, transactions } as const;
};

const passThroughRefundLockDeadlineCheckpoint = () => {
    for (const [deadline, transactions] of TRANSACTIONS_REFUND_LOCKED_DEADLINES) {
        if (deadline > Date.now()) return;
        transactions.forEach(tx => void (tx.refundDetails!.refundLocked = false));
        TRANSACTIONS_REFUND_LOCKED_DEADLINES.delete(deadline);
    }
};

const i18n = new Localization().i18n;

const DownloadFields: Record<ITransactionExportColumn, (transaction: ITransaction) => string> = {
    id: ({ id }) => id,
    balanceAccountId: ({ balanceAccountId }) => balanceAccountId,
    createdAt: ({ createdAt }) => `"${new Date(createdAt).toISOString()}"`,
    status: ({ status }) => status,
    paymentMethod: ({ paymentMethod, bankAccount }) =>
        (paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits) ?? '',
    category: ({ category }) => category,
    paymentPspReference: ({ paymentPspReference }) => paymentPspReference ?? '',
    currency: ({ netAmount: amount }) => amount.currency,
    netAmount: ({ netAmount: amount }) => `"${i18n.amount(amount.value, amount.currency)}"`,
    amountBeforeDeductions: ({ amountBeforeDeductions: amount }) => `"${i18n.amount(amount.value, amount.currency)}"`,
};

if (ALL_TRANSACTIONS.length === 0) {
    [...TRANSACTIONS]
        .sort(({ category: a }, { category: b }) => {
            if (a === 'Payment') return -1;
            if (b === 'Payment') return 1;
            return 0;
        })
        .forEach(transaction => {
            ALL_TRANSACTIONS.push(enrichTransactionDataWithDetails(transaction));
        });
}

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
                return getTransactionWithAmountDeduction(tx, deduction);
            }),
            _links: getPaginationLinks(cursor, limit, transactions.length),
        });
    }),

    http.get(mockEndpoints.transactionsTotals, ({ request }) => {
        const { periodHash, periodTransactions } = fetchTransactionsForRequest(request);
        let totals = TRANSACTIONS_TOTALS_CACHE.get(periodHash);

        if (totals === undefined) {
            totals = periodTransactions.reduce((currencyTotalsMap, transaction) => {
                const { value: amount, currency } = transaction.netAmount;
                const type = amount >= 0 ? 'incomings' : 'expenses';
                let currencyTotals = currencyTotalsMap.get(currency);

                if (currencyTotals === undefined) {
                    currencyTotals = {
                        expenses: 0,
                        incomings: 0,
                        total: 0,
                        breakdown: {
                            expenses: [],
                            incomings: [],
                        },
                    };
                    currencyTotalsMap.set(currency, currencyTotals);
                }

                const breakdown = currencyTotals.breakdown[type];
                let categoryTotals = breakdown.find(({ category }) => category === transaction.category);

                if (categoryTotals === undefined) {
                    categoryTotals = { category: transaction.category, value: 0 };
                    breakdown.push(categoryTotals);
                }

                categoryTotals.value += amount;
                currencyTotals.total += amount;
                currencyTotals[type] += amount;

                breakdown.sort(({ category: categoryA, value: valueA }, { category: categoryB, value: valueB }) => {
                    if (categoryA === 'Other') return 1;
                    if (categoryB === 'Other') return -1;
                    if (type === 'expenses') return valueA - valueB;
                    return valueB - valueA;
                });

                return currencyTotalsMap;
            }, new Map<string, _ITransactionTotals>());

            TRANSACTIONS_TOTALS_CACHE.set(periodHash, totals);
        }

        const data: (_ITransactionTotals & { currency: string })[] = [];

        for (const [currency, currencyTotals] of totals) {
            data.push({ currency, ...currencyTotals });
        }

        return HttpResponse.json({ data });
    }),

    http.get(mockEndpoints.downloadTransactions, async ({ request }) => {
        await delay(500);
        const { transactions } = fetchTransactionsForRequest(request);
        const columnsParam = new URLSearchParams(new URL(request.url).searchParams).getAll('columns');
        const columns = (Object.keys(DownloadFields) as ITransactionExportColumn[]).filter(column => columnsParam.includes(column));

        if (columns.length === 0 || transactions.length === 0) {
            return new HttpResponse(null, { status: 204 });
        }

        return new HttpResponse(
            new Blob(
                columns.length
                    ? [
                          `${columns.join(',')}\r\n`,
                          ...transactions
                              .slice(0, 100)
                              .map(transaction => `${columns.map(column => DownloadFields[column](transaction)).join(',')}\r\n`),
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
        const { amount, refundReason } = (await request.json()) as ITransactionRefundPayload;

        if (amount?.value && amount.value > 0 && refundReason) {
            const transaction = ALL_TRANSACTIONS.find(
                mock =>
                    mock.id === params.id &&
                    mock.category === 'Payment' &&
                    mock.refundDetails &&
                    mock.refundDetails.refundMode !== 'non_refundable' &&
                    !mock.refundDetails.refundLocked &&
                    mock.refundDetails.refundableAmount &&
                    mock.refundDetails.refundableAmount.currency === amount.currency &&
                    mock.refundDetails.refundableAmount.value >= amount.value
            );

            if (transaction) {
                const lockDeadline = Date.now() + 2 * 60 * 1000; // 2 minutes
                const deadlineTransactions = getMappedValue(lockDeadline, TRANSACTIONS_REFUND_LOCKED_DEADLINES, () => new Set())!;

                deadlineTransactions.add(transaction);
                transaction.refundDetails!.refundLocked = true;

                return HttpResponse.json({ amount, refundReason, status: 'received' } satisfies ITransactionRefundResponse);
            }
        }

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
    }),
];

const sharedMockEndpointsHandlers = [
    http.post(mockEndpoints.initiateRefund, async ({ request }) => {
        await mswDelay(2000);
        const { amount, refundReason } = (await request.json()) as ITransactionRefundPayload;
        return HttpResponse.json({ amount, refundReason, status: 'received' } satisfies ITransactionRefundResponse);
    }),
] as const;

export const TRANSACTION_DETAILS_HANDLERS = {
    default: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...PARTIALLY_REFUNDED_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    completeDetails: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...COMPLETE_TRANSACTION_DETAILS, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    fullRefund: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                const transaction = params.id === ORIGINAL_PAYMENT_ID ? FULLY_REFUNDED_TRANSACTION : FULL_REFUND_TRANSACTION;
                return HttpResponse.json({ ...transaction, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    partialRefund: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                const transaction = params.id === ORIGINAL_PAYMENT_ID ? PARTIALLY_REFUNDED_TRANSACTION : PARTIAL_REFUND_TRANSACTION;
                return HttpResponse.json({ ...transaction, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundNotAvailable: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...BASE_TRANSACTION, id: params.id });
            }),
            http.post(mockEndpoints.setup, () => {
                const { initiateRefund, ...endpoints } = setupBasicResponse.endpoints;
                return HttpResponse.json({ endpoints });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundLocked: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...REFUND_LOCKED_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundFails: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...PARTIALLY_REFUNDED_TRANSACTION, id: params.id });
            }),
            http.post(mockEndpoints.initiateRefund, () => {
                return HttpResponse.error();
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundableFullAmount: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...FULLY_REFUNDABLE_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundablePartialAmount: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...PARTIALLY_REFUNDABLE_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    notRefundable: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...BASE_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundedFully: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...FULLY_REFUNDED_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundedPartially: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...PARTIALLY_REFUNDED_TRANSACTION, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
    refundedPartiallyWithStatuses: {
        handlers: [
            http.get(mockEndpoints.transaction, ({ params }) => {
                return HttpResponse.json({ ...PARTIALLY_REFUNDED_TRANSACTION_WITH_STATUSES, id: params.id });
            }),
            ...sharedMockEndpointsHandlers,
        ],
    },
};
