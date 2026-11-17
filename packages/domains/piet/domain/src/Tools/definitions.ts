import { DEFAULT_PAGE_LIMITS } from '@integration-components/utils';
import type { components as TransactionsSchemas } from '@integration-components/types/api/resources/TransactionsResourceV2';
import type { components as DisputesSchemas } from '@integration-components/types/api/resources/DisputesResourceV1';
import type { components as PayByLinkSchemas } from '@integration-components/types/api/resources/PayByLinkResourceV1';
import { ToolArgumentError, readDateTime, readCurrencyList, readEnum, readEnumList, readId, readLimit, readString, readTimestamp } from './arguments';
import { defineTool, type ToolArguments } from './types';

type Amount = { value: number; currency: string };

const TRANSACTION_CATEGORIES = [
    'ATM',
    'Capital',
    'Correction',
    'Payment',
    'Refund',
    'Chargeback',
    'Transfer',
    'Other',
] as const satisfies readonly TransactionsSchemas['schemas']['Category'][];
const TRANSACTION_STATUSES = ['Pending', 'Booked', 'Reversed'] as const satisfies readonly TransactionsSchemas['schemas']['Status'][];
const SORT_DIRECTIONS = ['asc', 'desc'] as const satisfies readonly TransactionsSchemas['schemas']['SortDirection'][];

const DISPUTE_STATUS_GROUPS = [
    'CHARGEBACKS',
    'FRAUD_ALERTS',
    'ONGOING_AND_CLOSED',
] as const satisfies readonly DisputesSchemas['schemas']['StatusGroup'][];
const DISPUTE_REASON_CATEGORIES = [
    'FRAUD',
    'CONSUMER_DISPUTE',
    'PROCESSING_ERROR',
    'REQUEST_FOR_INFORMATION',
    'AUTHORISATION_ERROR',
    'ADJUSTMENT',
    'OTHER',
] as const satisfies readonly DisputesSchemas['schemas']['DisputeCategory'][];
const PAYMENT_LINK_STATUSES = [
    'active',
    'paymentPending',
    'expired',
    'completed',
] as const satisfies readonly PayByLinkSchemas['schemas']['PaymentLinkStatus'][];
const PAYMENT_LINK_TYPES = ['open', 'singleUse'] as const satisfies readonly PayByLinkSchemas['schemas']['PaymentLinkType'][];

const DEFAULT_LIMIT = 10;

const PSP_REFERENCE = /^[A-Za-z0-9]{16}$/;

const AMOUNT_NOTE = 'Amounts are objects with `value` in minor units (e.g. 1234 EUR = 12.34 EUR) and an ISO `currency`.';
const PAGINATION_NOTE = 'The result includes `nextCursor` when more records exist; pass it as `cursor` to get the next page.';

const balanceAccountId = {
    type: 'string',
    description: 'ID of the balance account. Use listBalanceAccounts to find it.',
};
const createdSince = { type: 'string', description: 'Only records created at or after this ISO 8601 date or date-time.' };
const createdUntil = { type: 'string', description: 'Only records created at or before this ISO 8601 date or date-time.' };
const limit = { type: 'integer', enum: [...DEFAULT_PAGE_LIMITS], description: `Records per page. Defaults to ${DEFAULT_LIMIT}.` };
const cursor = { type: 'string', description: 'Pagination cursor from a previous result.' };

const toAmount = ({ value, currency }: Amount): Amount => ({ value, currency });

/**
 * The tools Piet offers to the model. All of them are read-only.
 *
 * API responses contain data written by merchants and shoppers (descriptions, references, names). Tools therefore return
 * only a fixed set of fields, and the model must treat the result as data, never as instructions.
 */
export const listBalanceAccounts = defineTool({
    name: 'listBalanceAccounts',
    description: 'Lists the balance accounts the user can access. Call this first to find the `balanceAccountId` other tools require.',
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    endpoint: 'getBalanceAccounts',
    statusKey: 'piet.chat.statuses.tools.listBalanceAccounts',
    query: () => undefined,
    summarize: ({ data }) => ({
        balanceAccounts: data.map(({ id, description, defaultCurrencyCode, timeZone }) => ({ id, description, defaultCurrencyCode, timeZone })),
    }),
});

const DATE_RANGE_NOTE =
    'Without a date range the API only searches a short recent period, so records older than that are not found. Always set both createdSince and createdUntil.';

const transactionFilterProperties = {
    balanceAccountId,
    createdSince: { ...createdSince, description: `${createdSince.description} ${DATE_RANGE_NOTE}` },
    createdUntil: { ...createdUntil, description: `${createdUntil.description} Set it together with createdSince.` },
    categories: { type: 'array', items: { type: 'string', enum: [...TRANSACTION_CATEGORIES] }, description: 'Only these categories.' },
    statuses: { type: 'array', items: { type: 'string', enum: [...TRANSACTION_STATUSES] }, description: 'Only these statuses.' },
    currencies: { type: 'array', items: { type: 'string' }, description: 'Only these ISO 4217 currency codes, e.g. ["EUR"].' },
    paymentPspReference: {
        type: 'string',
        description:
            'Only transactions of the payment with this PSP reference (16 characters). Use it to find the transaction ID of a payment. The payment can be old: set a wide date range, for example the last 12 months, or it may not be found.',
    },
};

const readTransactionFilters = (args: ToolArguments) => ({
    balanceAccountId: readString(args, 'balanceAccountId', { required: true })!,
    createdSince: readDateTime(args, 'createdSince'),
    createdUntil: readDateTime(args, 'createdUntil'),
    categories: readEnumList(args, 'categories', TRANSACTION_CATEGORIES),
    statuses: readEnumList(args, 'statuses', TRANSACTION_STATUSES),
    currencies: readCurrencyList(args, 'currencies'),
    paymentPspReference: readString(args, 'paymentPspReference'),
});

export const listTransactions = defineTool({
    name: 'listTransactions',
    description: `Lists transactions of a balance account, newest first by default. Also use it to find the transaction ID that goes with a PSP reference: filter by \`paymentPspReference\`. ${DATE_RANGE_NOTE} When searching for a specific payment, use a wide range, such as the last 12 months or longer. ${AMOUNT_NOTE} ${PAGINATION_NOTE}`,
    parameters: {
        type: 'object',
        properties: {
            ...transactionFilterProperties,
            sortDirection: { type: 'string', enum: [...SORT_DIRECTIONS], description: 'Sort by creation date. Defaults to desc.' },
            limit,
            cursor,
        },
        required: ['balanceAccountId'],
        additionalProperties: false,
    },
    endpoint: 'getTransactions',
    statusKey: 'piet.chat.statuses.tools.listTransactions',
    query: args => ({
        ...readTransactionFilters(args),
        sortDirection: readEnum(args, 'sortDirection', SORT_DIRECTIONS),
        limit: readLimit(args, DEFAULT_PAGE_LIMITS, DEFAULT_LIMIT),
        cursor: readString(args, 'cursor'),
    }),
    summarize: ({ data, _links }) => ({
        transactions: data.map(({ id, createdAt, category, status, netAmount, paymentPspReference }) => ({
            id,
            createdAt,
            category,
            status,
            netAmount: toAmount(netAmount),
            paymentPspReference,
        })),
        nextCursor: _links?.next?.cursor,
    }),
});

export const getTransactionTotals = defineTool({
    name: 'getTransactionTotals',
    description: `Sums the money coming in (\`incomings\`) and going out (\`expenses\`) of the transactions that match the filters, per currency, with the net result and a breakdown per category. These are totals of transactions in the period, not the current balance of the account. Use \`createdSince\` and \`createdUntil\` to choose the period. ${AMOUNT_NOTE}`,
    parameters: { type: 'object', properties: transactionFilterProperties, required: ['balanceAccountId'], additionalProperties: false },
    endpoint: 'getTransactionTotals',
    statusKey: 'piet.chat.statuses.tools.getTransactionTotals',
    query: readTransactionFilters,
    summarize: ({ data }) => ({
        totals: data.map(({ currency, incomings, expenses, total, breakdown }) => ({
            currency,
            incomings: toAmount({ value: incomings, currency }),
            expenses: toAmount({ value: expenses, currency }),
            net: toAmount({ value: total, currency }),
            incomingsByCategory: breakdown.incomings.map(({ category, value }) => ({ category, amount: toAmount({ value, currency }) })),
            expensesByCategory: breakdown.expenses.map(({ category, value }) => ({ category, amount: toAmount({ value, currency }) })),
        })),
    }),
});

export const listPayouts = defineTool({
    name: 'listPayouts',
    description: `Lists payouts of a balance account, newest first. ${AMOUNT_NOTE} ${PAGINATION_NOTE}`,
    parameters: {
        type: 'object',
        properties: { balanceAccountId, createdSince, createdUntil, limit, cursor },
        required: ['balanceAccountId'],
        additionalProperties: false,
    },
    endpoint: 'getPayouts',
    statusKey: 'piet.chat.statuses.tools.listPayouts',
    query: args => ({
        balanceAccountId: readString(args, 'balanceAccountId', { required: true })!,
        createdSince: readDateTime(args, 'createdSince'),
        createdUntil: readDateTime(args, 'createdUntil'),
        limit: readLimit(args, DEFAULT_PAGE_LIMITS, DEFAULT_LIMIT),
        cursor: readString(args, 'cursor'),
    }),
    summarize: ({ data, _links }) => ({
        payouts: data.map(({ createdAt, payoutAmount, fundsCapturedAmount, adjustmentAmount, unpaidAmount, isSumOfSameDayPayouts }) => ({
            createdAt,
            isSumOfSameDayPayouts,
            payoutAmount: toAmount(payoutAmount),
            fundsCapturedAmount: toAmount(fundsCapturedAmount),
            adjustmentAmount: toAmount(adjustmentAmount),
            unpaidAmount: toAmount(unpaidAmount),
        })),
        nextCursor: _links?.next?.cursor,
    }),
});

export const getPayoutDetails = defineTool({
    name: 'getPayoutDetails',
    description: `Gets one payout with the breakdown, per category, of the funds captured and the adjustments it consists of. A payout has no ID: it is identified by its balance account and its \`createdAt\` timestamp, which must be copied exactly from the listPayouts result. ${AMOUNT_NOTE}`,
    parameters: {
        type: 'object',
        properties: {
            balanceAccountId,
            createdAt: { type: 'string', description: 'The `createdAt` of the payout, copied exactly from the listPayouts result.' },
        },
        required: ['balanceAccountId', 'createdAt'],
        additionalProperties: false,
    },
    endpoint: 'getPayout',
    statusKey: 'piet.chat.statuses.tools.getPayoutDetails',
    query: args => ({
        balanceAccountId: readString(args, 'balanceAccountId', { required: true })!,
        createdAt: readTimestamp(args, 'createdAt'),
    }),
    summarize: ({ payout, amountBreakdowns }) => ({
        payout: payout && {
            createdAt: payout.createdAt,
            isSumOfSameDayPayouts: payout.isSumOfSameDayPayouts,
            payoutAmount: toAmount(payout.payoutAmount),
            fundsCapturedAmount: toAmount(payout.fundsCapturedAmount),
            adjustmentAmount: toAmount(payout.adjustmentAmount),
            unpaidAmount: toAmount(payout.unpaidAmount),
        },
        fundsCapturedBreakdown: amountBreakdowns?.fundsCapturedBreakdown?.map(({ category, amount }) => ({
            category,
            amount: amount && toAmount(amount),
        })),
        adjustmentBreakdown: amountBreakdowns?.adjustmentBreakdown?.map(({ category, amount }) => ({ category, amount: amount && toAmount(amount) })),
    }),
});

export const getCapitalState = defineTool({
    name: 'getCapitalState',
    description: `Gets the user's capital (business financing): their active or pending loans ("grants") with amounts, repayment progress and status, any actions still required from them, whether a loan can be renewed, and the loan amounts currently on offer. ${AMOUNT_NOTE} \`repaymentRate\` is the share of incoming sales used to repay.`,
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    endpoint: 'getCapitalState',
    statusKey: 'piet.chat.statuses.tools.getCapitalState',
    query: () => ({}),
    summarize: ({ activeOrPendingGrants, dynamicOffer, hasClosedGrants }) => ({
        grants: activeOrPendingGrants.map(grant => ({
            id: grant.id,
            status: grant.status,
            balanceAccountId: grant.balanceAccountCode,
            balanceAccountDescription: grant.balanceAccountDescription,
            grantAmount: toAmount(grant.grantAmount),
            feesAmount: toAmount(grant.feesAmount),
            totalAmount: toAmount(grant.totalAmount),
            repaidTotalAmount: toAmount(grant.repaidTotalAmount),
            remainingTotalAmount: toAmount(grant.remainingTotalAmount),
            remainingGrantAmount: toAmount(grant.remainingGrantAmount),
            remainingFeesAmount: toAmount(grant.remainingFeesAmount),
            thresholdAmount: toAmount(grant.thresholdAmount),
            repaymentRate: grant.repaymentRate,
            expectedRepaymentPeriodDays: grant.expectedRepaymentPeriodDays,
            maximumRepaymentPeriodDays: grant.maximumRepaymentPeriodDays,
            repaymentPeriodLeftDays: grant.repaymentPeriodLeft,
            termEndsAt: grant.termEndsAt,
            offerExpiresAt: grant.offerExpiresAt,
            missingActions: grant.missingActions?.map(({ type }) => type),
            renewal: grant.renewal && {
                eligible: grant.renewal.eligible,
                minimumRenewalAmount: grant.renewal.minimumRenewalAmount && toAmount(grant.renewal.minimumRenewalAmount),
            },
        })),
        availableOffer: dynamicOffer && {
            minAmount: toAmount(dynamicOffer.minAmount),
            maxAmount: toAmount(dynamicOffer.maxAmount),
            step: dynamicOffer.step,
            estimatedRepaymentTermsInDays: dynamicOffer.estimatedRepaymentTermsInDays,
        },
        hasClosedGrants,
    }),
});

export const listDisputes = defineTool({
    name: 'listDisputes',
    description: `Lists disputes (chargebacks, fraud alerts and requests for information). \`statusGroup\` selects which disputes: CHARGEBACKS (open chargebacks), FRAUD_ALERTS, or ONGOING_AND_CLOSED. ${AMOUNT_NOTE} ${PAGINATION_NOTE}`,
    parameters: {
        type: 'object',
        properties: {
            statusGroup: { type: 'string', enum: [...DISPUTE_STATUS_GROUPS], description: 'Which group of disputes to list.' },
            balanceAccountId: { ...balanceAccountId, description: 'Only disputes of this balance account. Use listBalanceAccounts to find it.' },
            createdSince,
            createdUntil,
            reasonCategories: {
                type: 'array',
                items: { type: 'string', enum: [...DISPUTE_REASON_CATEGORIES] },
                description: 'Only these reason categories.',
            },
            limit,
            cursor,
        },
        required: ['statusGroup'],
        additionalProperties: false,
    },
    endpoint: 'getDisputeList',
    statusKey: 'piet.chat.statuses.tools.listDisputes',
    query: args => ({
        statusGroup: readEnum(args, 'statusGroup', DISPUTE_STATUS_GROUPS, { required: true })!,
        balanceAccountId: readString(args, 'balanceAccountId'),
        createdSince: readDateTime(args, 'createdSince'),
        createdUntil: readDateTime(args, 'createdUntil'),
        reasonCategories: readEnumList(args, 'reasonCategories', DISPUTE_REASON_CATEGORIES),
        limit: readLimit(args, DEFAULT_PAGE_LIMITS, DEFAULT_LIMIT),
        cursor: readString(args, 'cursor'),
    }),
    summarize: ({ data = [], _links }) => ({
        disputes: data.map(({ disputePspReference, createdAt, dueDate, amount, status, reason }) => ({
            disputePspReference,
            createdAt,
            dueDate,
            amount: toAmount(amount),
            status,
            reason: { category: reason.category, title: reason.title },
        })),
        nextCursor: _links?.next?.cursor,
    }),
});

export const listPaymentLinks = defineTool({
    name: 'listPaymentLinks',
    description: `Lists the payment links the user created, newest first. ${AMOUNT_NOTE} ${PAGINATION_NOTE}`,
    parameters: {
        type: 'object',
        properties: {
            createdSince,
            createdUntil,
            statuses: { type: 'array', items: { type: 'string', enum: [...PAYMENT_LINK_STATUSES] }, description: 'Only links with these statuses.' },
            linkTypes: { type: 'array', items: { type: 'string', enum: [...PAYMENT_LINK_TYPES] }, description: 'Only these link types.' },
            merchantReference: { type: 'string', description: 'Only links with this merchant reference.' },
            limit,
            cursor,
        },
        additionalProperties: false,
    },
    endpoint: 'getPaymentLinks',
    statusKey: 'piet.chat.statuses.tools.listPaymentLinks',
    query: args => ({
        createdSince: readDateTime(args, 'createdSince'),
        createdUntil: readDateTime(args, 'createdUntil'),
        statuses: readEnumList(args, 'statuses', PAYMENT_LINK_STATUSES),
        linkTypes: readEnumList(args, 'linkTypes', PAYMENT_LINK_TYPES),
        merchantReference: readString(args, 'merchantReference'),
        limit: readLimit(args, DEFAULT_PAGE_LIMITS, DEFAULT_LIMIT),
        cursor: readString(args, 'cursor'),
    }),
    summarize: ({ data, _links }) => ({
        paymentLinks: data.map(({ paymentLinkId, creationDate, expirationDate, linkType, merchantReference, status, amount, storeCode }) => ({
            paymentLinkId,
            creationDate,
            expirationDate,
            linkType,
            merchantReference,
            status,
            amount: toAmount(amount),
            storeCode,
        })),
        nextCursor: _links?.next?.cursor,
    }),
});

export const getTransactionDetails = defineTool({
    name: 'getTransactionDetails',
    description: `Gets the details of one transaction: amounts, deductions, payment method, status history and refund information. It needs the transaction ID: the long identifier that always begins with "EVJN" and that listTransactions returns as \`id\`. A PSP reference, also called paymentPspReference (a 16-character alphanumeric string), is not a transaction ID: first call listTransactions with the \`paymentPspReference\` filter (and a wide date range, because the payment may be old), then use the \`id\` of the transaction it returns. ${AMOUNT_NOTE}`,
    parameters: {
        type: 'object',
        properties: {
            transactionId: {
                type: 'string',
                description:
                    'The long transaction ID, which begins with "EVJN", as returned in `id` by listTransactions. Never a 16-character PSP reference.',
            },
        },
        required: ['transactionId'],
        additionalProperties: false,
    },
    endpoint: 'getTransaction',
    statusKey: 'piet.chat.statuses.tools.getTransactionDetails',
    query: () => undefined,
    path: args => {
        const transactionId = readId(args, 'transactionId');

        // A PSP reference is 16 characters long; transaction IDs are longer. Mixing them up is an easy mistake for a model.
        if (PSP_REFERENCE.test(transactionId)) {
            throw new ToolArgumentError(
                '"transactionId" looks like a PSP reference, not a transaction ID (those begin with "EVJN" and are longer). Call listTransactions with the paymentPspReference filter and a wide date range first, then use the `id` of the transaction it returns.'
            );
        }

        return { transactionId };
    },
    summarize: transaction => ({
        id: transaction.id,
        createdAt: transaction.createdAt,
        category: transaction.category,
        status: transaction.status,
        balanceAccountId: transaction.balanceAccountId,
        merchantReference: transaction.merchantReference,
        paymentPspReference: transaction.paymentPspReference,
        paymentMethod: transaction.paymentMethod && {
            type: transaction.paymentMethod.type,
            description: transaction.paymentMethod.description,
            lastFourDigits: transaction.paymentMethod.lastFourDigits,
        },
        amountBeforeDeductions: toAmount(transaction.amountBeforeDeductions),
        originalAmount: transaction.originalAmount && toAmount(transaction.originalAmount),
        netAmount: toAmount(transaction.netAmount),
        deductions: transaction.deductions?.map(({ type, value, currency }) => ({ type, amount: toAmount({ value, currency }) })),
        additions: transaction.additions?.map(({ type, value, currency }) => ({ type, amount: toAmount({ value, currency }) })),
        events: transaction.events?.map(({ createdAt, status, type, amount }) => ({ createdAt, status, type, amount: toAmount(amount) })),
        refund: transaction.refundDetails && {
            refundMode: transaction.refundDetails.refundMode,
            refundableAmount: transaction.refundDetails.refundableAmount && toAmount(transaction.refundDetails.refundableAmount),
        },
        refundOf: transaction.refundMetadata && {
            originalPaymentId: transaction.refundMetadata.originalPaymentId,
            refundPspReference: transaction.refundMetadata.refundPspReference,
            refundReason: transaction.refundMetadata.refundReason,
            refundType: transaction.refundMetadata.refundType,
        },
    }),
});

export const getDisputeDetails = defineTool({
    name: 'getDisputeDetails',
    description: `Gets the details of one dispute: its status, reason, deadline, whether it can be defended, the disputed payment and any defense already submitted. Use the \`disputePspReference\` from listDisputes. ${AMOUNT_NOTE}`,
    parameters: {
        type: 'object',
        properties: { disputePspReference: { type: 'string', description: 'PSP reference of the dispute, as returned by listDisputes.' } },
        required: ['disputePspReference'],
        additionalProperties: false,
    },
    endpoint: 'getDisputeDetail',
    statusKey: 'piet.chat.statuses.tools.getDisputeDetails',
    query: () => undefined,
    path: args => ({ disputePspReference: readId(args, 'disputePspReference') }),
    summarize: ({ dispute, payment, defense }) => ({
        dispute: {
            pspReference: dispute.pspReference,
            type: dispute.type,
            status: dispute.status,
            amount: toAmount(dispute.amount),
            createdAt: dispute.createdAt,
            dueDate: dispute.dueDate,
            acceptedDate: dispute.acceptedDate,
            defensibility: dispute.defensibility,
            allowedDefenseReasons: dispute.allowedDefenseReasons,
            reason: { category: dispute.reason.category, code: dispute.reason.code, title: dispute.reason.title },
        },
        payment: {
            pspReference: payment.pspReference,
            merchantReference: payment.merchantReference,
            isRefunded: payment.isRefunded,
            balanceAccount: payment.balanceAccount.description,
            paymentMethod: payment.paymentMethod && {
                type: payment.paymentMethod.type,
                description: payment.paymentMethod.description,
                lastFourDigits: payment.paymentMethod.lastFourDigits,
            },
        },
        defense: defense && {
            autodefended: defense.autodefended,
            defendedOn: defense.defendedOn,
            reason: defense.reason,
            suppliedDocumentCount: defense.suppliedDocuments?.length ?? 0,
        },
    }),
});

export const PIET_TOOLS = [
    listBalanceAccounts,
    listTransactions,
    getTransactionDetails,
    getTransactionTotals,
    listPayouts,
    getPayoutDetails,
    listDisputes,
    getDisputeDetails,
    listPaymentLinks,
    getCapitalState,
];
