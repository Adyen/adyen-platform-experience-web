import type { TranslationContractRegistry } from '@integration-components/core/translation-contract';
import { DISPUTES_TRANSLATION_LOADERS } from '@integration-components/disputes/domain';
import { PAY_BY_LINK_TRANSLATION_LOADERS } from '@integration-components/payByLink/domain';
import { PAYOUTS_TRANSLATION_LOADERS } from '@integration-components/payouts/domain';
import { REPORTS_TRANSLATION_LOADERS } from '@integration-components/reports/domain';
import { TRANSACTIONS_TRANSLATION_LOADERS } from '@integration-components/transactions/domain';

const reportsTarget = (key: string) =>
    ({
        domain: 'reports',
        format: 'v1',
        key,
        kind: 'domain',
    }) as const;

const payByLinkTarget = (key: string) =>
    ({
        domain: 'payByLink',
        format: 'v1',
        key,
        kind: 'domain',
    }) as const;

const payoutsTarget = (key: string) =>
    ({
        domain: 'payouts',
        format: 'v1',
        key,
        kind: 'domain',
    }) as const;

const disputesTarget = (key: string) =>
    ({
        domain: 'disputes',
        format: 'v1',
        key,
        kind: 'domain',
    }) as const;

const transactionsTarget = (key: string) =>
    ({
        domain: 'transactions',
        format: 'v1',
        key,
        kind: 'domain',
    }) as const;

const bentoTarget = (key: string) =>
    ({
        format: 'bento',
        key,
        kind: 'bento',
    }) as const;

export const V2_DOMAIN_TRANSLATION_LOADERS: Readonly<{
    disputes: typeof DISPUTES_TRANSLATION_LOADERS;
    payByLink: typeof PAY_BY_LINK_TRANSLATION_LOADERS;
    payouts: typeof PAYOUTS_TRANSLATION_LOADERS;
    reports: typeof REPORTS_TRANSLATION_LOADERS;
    transactions: typeof TRANSACTIONS_TRANSLATION_LOADERS;
}> = {
    disputes: DISPUTES_TRANSLATION_LOADERS,
    payByLink: PAY_BY_LINK_TRANSLATION_LOADERS,
    payouts: PAYOUTS_TRANSLATION_LOADERS,
    reports: REPORTS_TRANSLATION_LOADERS,
    transactions: TRANSACTIONS_TRANSLATION_LOADERS,
} as const;

/**
 * This is the single authored V2 route source.
 *
 * Every local/public pair is repeated deliberately, even while migration uses
 * matching names. The generator validates this data and produces Core runtime
 * lookup artifacts. Do not add inferred prefix or identity routing.
 */
export const V2_TRANSLATION_REGISTRY = {
    aliases: [],
    domains: ['disputes', 'payByLink', 'payouts', 'reports', 'transactions'],
    routes: [
        {
            publicKey: 'common.actions.contactSupport.labels.default',
            targets: [
                reportsTarget('reports.actions.contactSupport.labels.default'),
                disputesTarget('disputes.actions.contactSupport.labels.default'),
                transactionsTarget('transactions.actions.contactSupport.labels.default'),
            ],
        },
        {
            publicKey: 'common.actions.contactSupport.labels.reachOut',
            targets: [
                reportsTarget('reports.actions.contactSupport.labels.reachOut'),
                payoutsTarget('payouts.actions.contactSupport.labels.reachOut'),
                disputesTarget('disputes.actions.contactSupport.labels.reachOut'),
                transactionsTarget('transactions.actions.contactSupport.labels.reachOut'),
                payByLinkTarget('payByLink.actions.contactSupport.labels.reachOut'),
            ],
        },
        {
            publicKey: 'common.actions.copy.labels.done',
            targets: [
                reportsTarget('reports.actions.copy.labels.done'),
                payoutsTarget('payouts.actions.copy.labels.done'),
                disputesTarget('disputes.actions.copy.labels.done'),
                transactionsTarget('transactions.actions.copy.labels.done'),
                payByLinkTarget('payByLink.actions.copy.labels.done'),
            ],
        },
        {
            publicKey: 'common.actions.copy.labels.errorCode',
            targets: [
                reportsTarget('reports.actions.copy.labels.errorCode'),
                payoutsTarget('payouts.actions.copy.labels.errorCode'),
                disputesTarget('disputes.actions.copy.labels.errorCode'),
                transactionsTarget('transactions.actions.copy.labels.errorCode'),
                payByLinkTarget('payByLink.actions.copy.labels.errorCode'),
            ],
        },
        {
            publicKey: 'common.actions.download.labels.inProgress',
            targets: [
                reportsTarget('reports.actions.download.labels.inProgress'),
                disputesTarget('disputes.actions.download.labels.inProgress'),
                transactionsTarget('transactions.actions.download.labels.inProgress'),
            ],
        },
        {
            publicKey: 'common.actions.refresh.labels.default',
            targets: [
                reportsTarget('reports.actions.refresh.labels.default'),
                payoutsTarget('payouts.actions.refresh.labels.default'),
                disputesTarget('disputes.actions.refresh.labels.default'),
                transactionsTarget('transactions.actions.refresh.labels.default'),
                payByLinkTarget('payByLink.actions.refresh.labels.default'),
            ],
        },
        {
            publicKey: 'common.errors.contactSupport',
            targets: [
                reportsTarget('reports.errors.contactSupport'),
                payoutsTarget('payouts.errors.contactSupport'),
                disputesTarget('disputes.errors.contactSupport'),
                transactionsTarget('transactions.errors.contactSupport'),
                payByLinkTarget('payByLink.errors.contactSupport'),
            ],
        },
        {
            publicKey: 'common.errors.errorCode',
            targets: [
                reportsTarget('reports.errors.errorCode'),
                payoutsTarget('payouts.errors.errorCode'),
                disputesTarget('disputes.errors.errorCode'),
                transactionsTarget('transactions.errors.errorCode'),
                payByLinkTarget('payByLink.errors.errorCode'),
            ],
        },
        {
            publicKey: 'common.errors.errorCodeSupport',
            targets: [
                reportsTarget('reports.errors.errorCodeSupport'),
                payoutsTarget('payouts.errors.errorCodeSupport'),
                disputesTarget('disputes.errors.errorCodeSupport'),
                transactionsTarget('transactions.errors.errorCodeSupport'),
                payByLinkTarget('payByLink.errors.errorCodeSupport'),
            ],
        },
        {
            publicKey: 'common.errors.notFound',
            targets: [
                reportsTarget('reports.errors.notFound'),
                payoutsTarget('payouts.errors.notFound'),
                disputesTarget('disputes.errors.notFound'),
                transactionsTarget('transactions.errors.notFound'),
            ],
        },
        {
            publicKey: 'common.errors.requestInvalid',
            targets: [
                reportsTarget('reports.errors.requestInvalid'),
                payoutsTarget('payouts.errors.requestInvalid'),
                disputesTarget('disputes.errors.requestInvalid'),
                transactionsTarget('transactions.errors.requestInvalid'),
            ],
        },
        {
            publicKey: 'common.errors.retry',
            targets: [
                reportsTarget('reports.errors.retry'),
                payoutsTarget('payouts.errors.retry'),
                disputesTarget('disputes.errors.retry'),
                transactionsTarget('transactions.errors.retry'),
                payByLinkTarget('payByLink.errors.retry'),
            ],
        },
        {
            publicKey: 'common.errors.somethingWentWrong',
            targets: [
                reportsTarget('reports.errors.somethingWentWrong'),
                payoutsTarget('payouts.errors.somethingWentWrong'),
                disputesTarget('disputes.errors.somethingWentWrong'),
                transactionsTarget('transactions.errors.somethingWentWrong'),
                payByLinkTarget('payByLink.errors.somethingWentWrong'),
            ],
        },
        {
            publicKey: 'common.errors.unexpected',
            targets: [
                reportsTarget('reports.errors.unexpected'),
                payoutsTarget('payouts.errors.unexpected'),
                disputesTarget('disputes.errors.unexpected'),
                transactionsTarget('transactions.errors.unexpected'),
                payByLinkTarget('payByLink.errors.unexpected'),
            ],
        },
        {
            publicKey: 'common.errors.updateFilters',
            targets: [
                reportsTarget('reports.errors.updateFilters'),
                payoutsTarget('payouts.errors.updateFilters'),
                disputesTarget('disputes.errors.updateFilters'),
                transactionsTarget('transactions.errors.updateFilters'),
            ],
        },
        {
            publicKey: 'common.filters.types.account.label',
            targets: [
                reportsTarget('reports.filters.types.account.label'),
                payoutsTarget('payouts.filters.types.account.label'),
                disputesTarget('disputes.filters.types.account.label'),
                transactionsTarget('transactions.filters.types.account.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.label',
            targets: [
                reportsTarget('reports.filters.types.date.label'),
                payoutsTarget('payouts.filters.types.date.label'),
                disputesTarget('disputes.filters.types.date.label'),
                transactionsTarget('transactions.filters.types.date.label'),
                payByLinkTarget('payByLink.filters.types.date.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.last30Days',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.last30Days'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.last30Days'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.last30Days'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.last30Days'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.last30Days'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.last7Days',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.last7Days'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.last7Days'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.last7Days'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.last7Days'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.last7Days'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.last90Days',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.last90Days'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.last90Days'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.last90Days'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.lastMonth',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.lastMonth'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.lastMonth'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.lastMonth'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.lastMonth'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.lastMonth'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.lastWeek',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.lastWeek'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.lastWeek'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.lastWeek'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.lastWeek'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.lastWeek'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.thisMonth',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.thisMonth'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.thisMonth'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.thisMonth'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.thisMonth'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.thisMonth'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.thisWeek',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.thisWeek'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.thisWeek'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.thisWeek'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.thisWeek'),
                payByLinkTarget('payByLink.filters.types.date.rangeSelect.options.thisWeek'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.yearToDate',
            targets: [
                reportsTarget('reports.filters.types.date.rangeSelect.options.yearToDate'),
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.yearToDate'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.yearToDate'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.yearToDate'),
            ],
        },
        {
            publicKey: 'reports.common.types.payout',
            targets: [reportsTarget('reports.common.types.payout')],
        },
        {
            publicKey: 'reports.overview.errors.download',
            targets: [reportsTarget('reports.overview.errors.download')],
        },
        {
            publicKey: 'reports.overview.errors.listEmpty',
            targets: [reportsTarget('reports.overview.errors.listEmpty')],
        },
        {
            publicKey: 'reports.overview.errors.listUnavailable',
            targets: [reportsTarget('reports.overview.errors.listUnavailable')],
        },
        {
            publicKey: 'reports.overview.errors.retryDownload',
            targets: [reportsTarget('reports.overview.errors.retryDownload')],
        },
        {
            publicKey: 'reports.overview.errors.tooManyDownloads',
            targets: [reportsTarget('reports.overview.errors.tooManyDownloads')],
        },
        {
            publicKey: 'reports.overview.errors.unavailable',
            targets: [reportsTarget('reports.overview.errors.unavailable')],
        },
        {
            publicKey: 'reports.overview.filters.label',
            targets: [reportsTarget('reports.overview.filters.label')],
        },
        {
            publicKey: 'reports.overview.generateInfo',
            targets: [reportsTarget('reports.overview.generateInfo')],
        },
        {
            publicKey: 'reports.overview.list.controls.downloadReport.label',
            targets: [reportsTarget('reports.overview.list.controls.downloadReport.label')],
        },
        {
            publicKey: 'reports.overview.list.fields._sendEmail',
            targets: [reportsTarget('reports.overview.list.fields._sendEmail')],
        },
        {
            publicKey: 'reports.overview.list.fields._summary',
            targets: [reportsTarget('reports.overview.list.fields._summary')],
        },
        {
            publicKey: 'reports.overview.list.fields.createdAt',
            targets: [reportsTarget('reports.overview.list.fields.createdAt')],
        },
        {
            publicKey: 'reports.overview.list.fields.reportFile',
            targets: [reportsTarget('reports.overview.list.fields.reportFile')],
        },
        {
            publicKey: 'reports.overview.list.fields.reportType',
            targets: [reportsTarget('reports.overview.list.fields.reportType')],
        },
        {
            publicKey: 'reports.overview.pagination.controls.limitSelect.label',
            targets: [reportsTarget('reports.overview.pagination.controls.limitSelect.label')],
        },
        {
            publicKey: 'reports.overview.pagination.label',
            targets: [reportsTarget('reports.overview.pagination.label')],
        },
        {
            publicKey: 'reports.overview.title',
            targets: [reportsTarget('reports.overview.title')],
        },
        {
            publicKey: 'common.errors.accountInvalid',
            targets: [
                reportsTarget('reports.errors.accountInvalid'),
                payoutsTarget('payouts.errors.accountInvalid'),
                disputesTarget('disputes.errors.accountInvalid'),
                transactionsTarget('transactions.errors.accountInvalid'),
            ],
        },
        {
            publicKey: 'common.errors.accountUnavailable',
            targets: [
                reportsTarget('reports.errors.accountUnavailable'),
                payoutsTarget('payouts.errors.accountUnavailable'),
                disputesTarget('disputes.errors.accountUnavailable'),
                transactionsTarget('transactions.errors.accountUnavailable'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.last180Days',
            targets: [
                payoutsTarget('payouts.filters.types.date.rangeSelect.options.last180Days'),
                disputesTarget('disputes.filters.types.date.rangeSelect.options.last180Days'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.last180Days'),
            ],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.correction',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.correction')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.fee',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.fee')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.grantIssued',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.grantIssued')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.grantRepayment',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.grantRepayment')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.other',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.other')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.refund',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.refund')],
        },
        {
            publicKey: 'payouts.details.breakdown.adjustments.types.transfer',
            targets: [payoutsTarget('payouts.details.breakdown.adjustments.types.transfer')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.additions',
            targets: [payoutsTarget('payouts.details.breakdown.fields.additions')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.adjustments',
            targets: [payoutsTarget('payouts.details.breakdown.fields.adjustments')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.fundsCaptured',
            targets: [payoutsTarget('payouts.details.breakdown.fields.fundsCaptured')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.netPayout',
            targets: [payoutsTarget('payouts.details.breakdown.fields.netPayout')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.remainingAmount',
            targets: [payoutsTarget('payouts.details.breakdown.fields.remainingAmount')],
        },
        {
            publicKey: 'payouts.details.breakdown.fields.subtractions',
            targets: [payoutsTarget('payouts.details.breakdown.fields.subtractions')],
        },
        {
            publicKey: 'payouts.details.breakdown.fundsCaptured.types.capture',
            targets: [payoutsTarget('payouts.details.breakdown.fundsCaptured.types.capture')],
        },
        {
            publicKey: 'payouts.details.breakdown.fundsCaptured.types.chargeback',
            targets: [payoutsTarget('payouts.details.breakdown.fundsCaptured.types.chargeback')],
        },
        {
            publicKey: 'payouts.details.breakdown.fundsCaptured.types.correction',
            targets: [payoutsTarget('payouts.details.breakdown.fundsCaptured.types.correction')],
        },
        {
            publicKey: 'payouts.details.breakdown.fundsCaptured.types.refund',
            targets: [payoutsTarget('payouts.details.breakdown.fundsCaptured.types.refund')],
        },
        {
            publicKey: 'payouts.details.errors.unavailable',
            targets: [payoutsTarget('payouts.details.errors.unavailable')],
        },
        {
            publicKey: 'payouts.details.tags.netPayout',
            targets: [payoutsTarget('payouts.details.tags.netPayout')],
        },
        {
            publicKey: 'payouts.details.tags.sameDaySum',
            targets: [payoutsTarget('payouts.details.tags.sameDaySum')],
        },
        {
            publicKey: 'payouts.details.title',
            targets: [payoutsTarget('payouts.details.title')],
        },
        {
            publicKey: 'payouts.overview.errors.listEmpty',
            targets: [payoutsTarget('payouts.overview.errors.listEmpty')],
        },
        {
            publicKey: 'payouts.overview.errors.listUnavailable',
            targets: [payoutsTarget('payouts.overview.errors.listUnavailable')],
        },
        {
            publicKey: 'payouts.overview.errors.unavailable',
            targets: [payoutsTarget('payouts.overview.errors.unavailable')],
        },
        {
            publicKey: 'payouts.overview.filters.label',
            targets: [payoutsTarget('payouts.overview.filters.label')],
        },
        {
            publicKey: 'payouts.overview.generateInfo',
            targets: [payoutsTarget('payouts.overview.generateInfo')],
        },
        {
            publicKey: 'payouts.overview.list.fields.adjustmentAmount',
            targets: [payoutsTarget('payouts.overview.list.fields.adjustmentAmount')],
        },
        {
            publicKey: 'payouts.overview.list.fields.createdAt',
            targets: [payoutsTarget('payouts.overview.list.fields.createdAt')],
        },
        {
            publicKey: 'payouts.overview.list.fields.fundsCapturedAmount',
            targets: [payoutsTarget('payouts.overview.list.fields.fundsCapturedAmount')],
        },
        {
            publicKey: 'payouts.overview.list.fields.payoutAmount',
            targets: [payoutsTarget('payouts.overview.list.fields.payoutAmount')],
        },
        {
            publicKey: 'payouts.overview.pagination.controls.limitSelect.label',
            targets: [payoutsTarget('payouts.overview.pagination.controls.limitSelect.label')],
        },
        {
            publicKey: 'payouts.overview.pagination.label',
            targets: [payoutsTarget('payouts.overview.pagination.label')],
        },
        {
            publicKey: 'payouts.overview.title',
            targets: [payoutsTarget('payouts.overview.title')],
        },
        {
            publicKey: 'common.actions.copy.labels.default',
            targets: [
                disputesTarget('disputes.actions.copy.labels.default'),
                transactionsTarget('transactions.actions.copy.labels.default'),
                payByLinkTarget('payByLink.actions.copy.labels.default'),
            ],
        },
        {
            publicKey: 'common.actions.dismiss.labels.dismiss',
            targets: [disputesTarget('disputes.actions.dismiss.labels.dismiss'), transactionsTarget('transactions.actions.dismiss.labels.dismiss')],
        },
        {
            publicKey: 'common.actions.download.labels.default',
            targets: [disputesTarget('disputes.actions.download.labels.default'), transactionsTarget('transactions.actions.download.labels.default')],
        },
        {
            publicKey: 'common.actions.reset.labels.default',
            targets: [disputesTarget('disputes.actions.reset.labels.default'), transactionsTarget('transactions.actions.reset.labels.default')],
        },
        {
            publicKey: 'common.errors.componentUnavailable',
            targets: [disputesTarget('disputes.errors.componentUnavailable'), transactionsTarget('transactions.errors.componentUnavailable')],
        },
        {
            publicKey: 'common.errors.fieldRequired',
            targets: [
                disputesTarget('disputes.errors.fieldRequired'),
                transactionsTarget('transactions.errors.fieldRequired'),
                payByLinkTarget('payByLink.errors.fieldRequired'),
            ],
        },
        {
            publicKey: 'common.errors.maxLength',
            targets: [
                disputesTarget('disputes.errors.maxLength'),
                transactionsTarget('transactions.errors.maxLength'),
                payByLinkTarget('payByLink.errors.maxLength'),
            ],
        },
        {
            publicKey: 'common.errors.minLength',
            targets: [
                disputesTarget('disputes.errors.minLength'),
                transactionsTarget('transactions.errors.minLength'),
                payByLinkTarget('payByLink.errors.minLength'),
            ],
        },
        {
            publicKey: 'common.filters.controls.resetAll.label',
            targets: [disputesTarget('disputes.filters.controls.resetAll.label'), transactionsTarget('transactions.filters.controls.resetAll.label')],
        },
        {
            publicKey: 'common.filters.label',
            targets: [disputesTarget('disputes.filters.label'), transactionsTarget('transactions.filters.label')],
        },
        {
            publicKey: 'common.filters.mobile.label',
            targets: [disputesTarget('disputes.filters.mobile.label'), transactionsTarget('transactions.filters.mobile.label')],
        },
        {
            publicKey: 'common.filters.types.account.options.all',
            targets: [
                disputesTarget('disputes.filters.types.account.options.all'),
                transactionsTarget('transactions.filters.types.account.options.all'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.errors.negative',
            targets: [
                disputesTarget('disputes.filters.types.amount.errors.negative'),
                transactionsTarget('transactions.filters.types.amount.errors.negative'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.errors.smallerMax',
            targets: [
                disputesTarget('disputes.filters.types.amount.errors.smallerMax'),
                transactionsTarget('transactions.filters.types.amount.errors.smallerMax'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.inputs.max.label',
            targets: [
                disputesTarget('disputes.filters.types.amount.inputs.max.label'),
                transactionsTarget('transactions.filters.types.amount.inputs.max.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.inputs.min.label',
            targets: [
                disputesTarget('disputes.filters.types.amount.inputs.min.label'),
                transactionsTarget('transactions.filters.types.amount.inputs.min.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.range.between',
            targets: [
                disputesTarget('disputes.filters.types.amount.range.between'),
                transactionsTarget('transactions.filters.types.amount.range.between'),
            ],
        },
        {
            publicKey: 'common.filters.types.amount.range.max',
            targets: [disputesTarget('disputes.filters.types.amount.range.max'), transactionsTarget('transactions.filters.types.amount.range.max')],
        },
        {
            publicKey: 'common.filters.types.amount.range.min',
            targets: [disputesTarget('disputes.filters.types.amount.range.min'), transactionsTarget('transactions.filters.types.amount.range.min')],
        },
        {
            publicKey: 'common.filters.types.amount.range.only',
            targets: [disputesTarget('disputes.filters.types.amount.range.only'), transactionsTarget('transactions.filters.types.amount.range.only')],
        },
        {
            publicKey: 'common.filters.types.date.calendar.label',
            targets: [
                disputesTarget('disputes.filters.types.date.calendar.label'),
                transactionsTarget('transactions.filters.types.date.calendar.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.calendar.navigation.label',
            targets: [
                disputesTarget('disputes.filters.types.date.calendar.navigation.label'),
                transactionsTarget('transactions.filters.types.date.calendar.navigation.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.calendar.navigation.nextMonth',
            targets: [
                disputesTarget('disputes.filters.types.date.calendar.navigation.nextMonth'),
                transactionsTarget('transactions.filters.types.date.calendar.navigation.nextMonth'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.calendar.navigation.previousMonth',
            targets: [
                disputesTarget('disputes.filters.types.date.calendar.navigation.previousMonth'),
                transactionsTarget('transactions.filters.types.date.calendar.navigation.previousMonth'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.range.between',
            targets: [
                disputesTarget('disputes.filters.types.date.range.between'),
                transactionsTarget('transactions.filters.types.date.range.between'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.range.since',
            targets: [disputesTarget('disputes.filters.types.date.range.since'), transactionsTarget('transactions.filters.types.date.range.since')],
        },
        {
            publicKey: 'common.filters.types.date.range.until',
            targets: [disputesTarget('disputes.filters.types.date.range.until'), transactionsTarget('transactions.filters.types.date.range.until')],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.label',
            targets: [
                disputesTarget('disputes.filters.types.date.rangeSelect.label'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.label'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.rangeSelect.options.custom',
            targets: [
                disputesTarget('disputes.filters.types.date.rangeSelect.options.custom'),
                transactionsTarget('transactions.filters.types.date.rangeSelect.options.custom'),
            ],
        },
        {
            publicKey: 'common.filters.types.date.timezoneInfo',
            targets: [disputesTarget('disputes.filters.types.date.timezoneInfo'), transactionsTarget('transactions.filters.types.date.timezoneInfo')],
        },
        {
            publicKey: 'common.inputs.file.actions.delete',
            targets: [disputesTarget('disputes.inputs.file.actions.delete'), transactionsTarget('transactions.inputs.file.actions.delete')],
        },
        {
            publicKey: 'common.inputs.file.errors.default',
            targets: [disputesTarget('disputes.inputs.file.errors.default'), transactionsTarget('transactions.inputs.file.errors.default')],
        },
        {
            publicKey: 'common.inputs.file.errors.disallowedType',
            targets: [
                disputesTarget('disputes.inputs.file.errors.disallowedType'),
                transactionsTarget('transactions.inputs.file.errors.disallowedType'),
            ],
        },
        {
            publicKey: 'common.inputs.file.errors.invalidDimensions',
            targets: [
                disputesTarget('disputes.inputs.file.errors.invalidDimensions'),
                transactionsTarget('transactions.inputs.file.errors.invalidDimensions'),
            ],
        },
        {
            publicKey: 'common.inputs.file.errors.required',
            targets: [disputesTarget('disputes.inputs.file.errors.required'), transactionsTarget('transactions.inputs.file.errors.required')],
        },
        {
            publicKey: 'common.inputs.file.errors.tooLarge',
            targets: [disputesTarget('disputes.inputs.file.errors.tooLarge'), transactionsTarget('transactions.inputs.file.errors.tooLarge')],
        },
        {
            publicKey: 'common.inputs.file.errors.tooMany',
            targets: [disputesTarget('disputes.inputs.file.errors.tooMany'), transactionsTarget('transactions.inputs.file.errors.tooMany')],
        },
        {
            publicKey: 'common.inputs.file.labels.default',
            targets: [disputesTarget('disputes.inputs.file.labels.default'), transactionsTarget('transactions.inputs.file.labels.default')],
        },
        {
            publicKey: 'common.inputs.search.clearSearch',
            targets: [disputesTarget('disputes.inputs.search.clearSearch'), transactionsTarget('transactions.inputs.search.clearSearch')],
        },
        {
            publicKey: 'common.inputs.select.errors.noOptions',
            targets: [disputesTarget('disputes.inputs.select.errors.noOptions'), transactionsTarget('transactions.inputs.select.errors.noOptions')],
        },
        {
            publicKey: 'common.inputs.select.placeholder',
            targets: [
                disputesTarget('disputes.inputs.select.placeholder'),
                transactionsTarget('transactions.inputs.select.placeholder'),
                payByLinkTarget('payByLink.inputs.select.placeholder'),
            ],
        },
        {
            publicKey: 'common.modal.controls.dismiss.label',
            targets: [disputesTarget('disputes.modal.controls.dismiss.label'), transactionsTarget('transactions.modal.controls.dismiss.label')],
        },
        {
            publicKey: 'common.pagination.controls.limitSelect',
            targets: [disputesTarget('disputes.pagination.controls.limitSelect'), transactionsTarget('transactions.pagination.controls.limitSelect')],
        },
        {
            publicKey: 'common.pagination.controls.limitSelect.label',
            targets: [
                disputesTarget('disputes.pagination.controls.limitSelect.label'),
                transactionsTarget('transactions.pagination.controls.limitSelect.label'),
            ],
        },
        {
            publicKey: 'common.pagination.label',
            targets: [disputesTarget('disputes.pagination.label'), transactionsTarget('transactions.pagination.label')],
        },
        {
            publicKey: 'common.tags.noData',
            targets: [disputesTarget('disputes.tags.noData'), transactionsTarget('transactions.tags.noData')],
        },
        {
            publicKey: 'common.timeline.timelineItem.showLess',
            targets: [disputesTarget('disputes.timeline.timelineItem.showLess'), transactionsTarget('transactions.timeline.timelineItem.showLess')],
        },
        {
            publicKey: 'common.timeline.timelineItem.showMoreItems',
            targets: [
                disputesTarget('disputes.timeline.timelineItem.showMoreItems'),
                transactionsTarget('transactions.timeline.timelineItem.showMoreItems'),
            ],
        },
        {
            publicKey: 'common.timeline.timelineItem.timeGap.a11y.label',
            targets: [
                disputesTarget('disputes.timeline.timelineItem.timeGap.a11y.label'),
                transactionsTarget('transactions.timeline.timelineItem.timeGap.a11y.label'),
            ],
        },
        {
            publicKey: 'common.timeline.timelineItem.timeGap.unit.day',
            targets: [
                disputesTarget('disputes.timeline.timelineItem.timeGap.unit.day'),
                transactionsTarget('transactions.timeline.timelineItem.timeGap.unit.day'),
            ],
        },
        {
            publicKey: 'common.timeline.timelineItem.timeGap.unit.day__plural',
            targets: [
                disputesTarget('disputes.timeline.timelineItem.timeGap.unit.day__plural'),
                transactionsTarget('transactions.timeline.timelineItem.timeGap.unit.day__plural'),
            ],
        },
        {
            publicKey: 'disputes.common.reasonCategories.adjustment',
            targets: [disputesTarget('disputes.common.reasonCategories.adjustment')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.authorisationError',
            targets: [disputesTarget('disputes.common.reasonCategories.authorisationError')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.consumerDispute',
            targets: [disputesTarget('disputes.common.reasonCategories.consumerDispute')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.fraud',
            targets: [disputesTarget('disputes.common.reasonCategories.fraud')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.other',
            targets: [disputesTarget('disputes.common.reasonCategories.other')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.processingError',
            targets: [disputesTarget('disputes.common.reasonCategories.processingError')],
        },
        {
            publicKey: 'disputes.common.reasonCategories.requestForInformation',
            targets: [disputesTarget('disputes.common.reasonCategories.requestForInformation')],
        },
        {
            publicKey: 'disputes.common.statuses.accepted',
            targets: [disputesTarget('disputes.common.statuses.accepted')],
        },
        {
            publicKey: 'disputes.common.statuses.expired',
            targets: [disputesTarget('disputes.common.statuses.expired')],
        },
        {
            publicKey: 'disputes.common.statuses.lost',
            targets: [disputesTarget('disputes.common.statuses.lost')],
        },
        {
            publicKey: 'disputes.common.statuses.pending',
            targets: [disputesTarget('disputes.common.statuses.pending')],
        },
        {
            publicKey: 'disputes.common.statuses.responded',
            targets: [disputesTarget('disputes.common.statuses.responded')],
        },
        {
            publicKey: 'disputes.common.statuses.undefended',
            targets: [disputesTarget('disputes.common.statuses.undefended')],
        },
        {
            publicKey: 'disputes.common.statuses.unresponded',
            targets: [disputesTarget('disputes.common.statuses.unresponded')],
        },
        {
            publicKey: 'disputes.common.statuses.won',
            targets: [disputesTarget('disputes.common.statuses.won')],
        },
        {
            publicKey: 'disputes.management.accept.chargeback.accepted',
            targets: [disputesTarget('disputes.management.accept.chargeback.accepted')],
        },
        {
            publicKey: 'disputes.management.accept.chargeback.actions.accept',
            targets: [disputesTarget('disputes.management.accept.chargeback.actions.accept')],
        },
        {
            publicKey: 'disputes.management.accept.chargeback.disclaimer',
            targets: [disputesTarget('disputes.management.accept.chargeback.disclaimer')],
        },
        {
            publicKey: 'disputes.management.accept.chargeback.title',
            targets: [disputesTarget('disputes.management.accept.chargeback.title')],
        },
        {
            publicKey: 'disputes.management.accept.common.accepted',
            targets: [disputesTarget('disputes.management.accept.common.accepted')],
        },
        {
            publicKey: 'disputes.management.accept.common.agree',
            targets: [disputesTarget('disputes.management.accept.common.agree')],
        },
        {
            publicKey: 'disputes.management.accept.requestForInformation.accepted',
            targets: [disputesTarget('disputes.management.accept.requestForInformation.accepted')],
        },
        {
            publicKey: 'disputes.management.accept.requestForInformation.actions.accept',
            targets: [disputesTarget('disputes.management.accept.requestForInformation.actions.accept')],
        },
        {
            publicKey: 'disputes.management.accept.requestForInformation.disclaimer',
            targets: [disputesTarget('disputes.management.accept.requestForInformation.disclaimer')],
        },
        {
            publicKey: 'disputes.management.accept.requestForInformation.title',
            targets: [disputesTarget('disputes.management.accept.requestForInformation.title')],
        },
        {
            publicKey: 'disputes.management.common.actions.goBack',
            targets: [disputesTarget('disputes.management.common.actions.goBack')],
        },
        {
            publicKey: 'disputes.management.common.actions.showDetails',
            targets: [disputesTarget('disputes.management.common.actions.showDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.acquirerRepresentmentForm',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.acquirerRepresentmentForm')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.acquirerRepresentmentFormAutomaticallyGenerated',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.acquirerRepresentmentFormAutomaticallyGenerated')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.acquirerRetrievalFulfilmentForm',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.acquirerRetrievalFulfilmentForm')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.acquirerRetrievalFulfilmentFormAutomaticallyGenerated',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.acquirerRetrievalFulfilmentFormAutomaticallyGenerated')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.additionalInformation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.additionalInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.additionalTransactions',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.additionalTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.additionalTransactionsConnectedWithDisputedFlight',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.additionalTransactionsConnectedWithDisputedFlight')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.alternativeDefenseMaterial',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.alternativeDefenseMaterial')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.amexFaxCover',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.amexFaxCover')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.appropriateExplanation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.appropriateExplanation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.appropriateExplanationAndDocTwoSeparateTransactions',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.appropriateExplanationAndDocTwoSeparateTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.authorizationNotObtained',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.authorizationNotObtained')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.authorizationNotObtainedHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.authorizationNotObtainedHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.autoGeneratedDocRetrievalRequestFulfilled',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.autoGeneratedDocRetrievalRequestFulfilled')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.automaticallyGeneratedTransactionDetails',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.automaticallyGeneratedTransactionDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.avsDocumentation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.avsDocumentation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cancelledRecurringBilling',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cancelledRecurringBilling')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cardholderAgreedToAmountRange',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cardholderAgreedToAmountRange')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cardholderResponsibleForAddendumTransaction',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cardholderResponsibleForAddendumTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cardholderResponsibleForDisputedAmount',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cardholderResponsibleForDisputedAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cardRecoveryBulletinOrExceptionFile',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cardRecoveryBulletinOrExceptionFile')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.cardRecoveryBulletinOrExceptionFileHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.cardRecoveryBulletinOrExceptionFileHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.chargebackRemediedOrInvalid',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.chargebackRemediedOrInvalid')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.chargeToWrongAccountNumber',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.chargeToWrongAccountNumber')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.chargeToWrongAccountNumberHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.chargeToWrongAccountNumberHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.clearingText',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.clearingText')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.compellingEvidence',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.compellingEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.copyOfInvoice',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.copyOfInvoice')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.copyOfInvoiceOrOtherRelevantTransactionDetails',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.copyOfInvoiceOrOtherRelevantTransactionDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.CopyOfSalesDraftDetails',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.CopyOfSalesDraftDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.CopyOfSalesDraftTitle',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.CopyOfSalesDraftTitle')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.copyOfTid',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.copyOfTid')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.coverPageForAmexDisputes',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.coverPageForAmexDisputes')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.creditNotProcessed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.creditNotProcessed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.creditNotProcessedHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.creditNotProcessedHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.creditNotProcessedReason',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.creditNotProcessedReason')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.creditsOfMilesShowingConnectionToCardholder',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.creditsOfMilesShowingConnectionToCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.customerWrittenConfirmation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.customerWrittenConfirmation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.defenseMaterial',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.defenseMaterial')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.deffectiveMerchandise',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.deffectiveMerchandise')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.deffectiveMerchandiseHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.deffectiveMerchandiseHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.deliveryOfFlightTicketAtAddress',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.deliveryOfFlightTicketAtAddress')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.descriptionOfDisputeReason',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.descriptionOfDisputeReason')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.descriptionOfMerchandiseOrServices',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.descriptionOfMerchandiseOrServices')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.differentSignature',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.differentSignature')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.differentSignatureHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.differentSignatureHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.disclosureAtPointOfInteraction',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.disclosureAtPointOfInteraction')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docAllOfFollowing',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docAllOfFollowing')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docCardholderIssuedPaperAirlineTickets',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docCardholderIssuedPaperAirlineTickets')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docChargebackCodeNotApplicable',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docChargebackCodeNotApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docCorrectCurrency',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docCorrectCurrency')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docIdentifyTransaction',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docIdentifyTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docMerchandiseNotCounterfeit',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docMerchandiseNotCounterfeit')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docProvingCardHolderParticipated',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docProvingCardHolderParticipated')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docRemediesChargeback',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docRemediesChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docsTwoTransactionsWithSameShopper',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docsTwoTransactionsWithSameShopper')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docTermsOfSaleNotMisrepresented',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docTermsOfSaleNotMisrepresented')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docTransactionOccurredOnPos',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docTransactionOccurredOnPos')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docTwoDifferentTransactions',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docTwoDifferentTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentationOfPositiveAvsResponseXOrY',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentationOfPositiveAvsResponseXOrY')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentCanBeCreditReasonDue',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentCanBeCreditReasonDue')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentCanBeProofOfDelivery',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentCanBeProofOfDelivery')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentCanBeSubscriptionAgreement',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentCanBeSubscriptionAgreement')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentCanBetUrlReturnPolicy',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentCanBetUrlReturnPolicy')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentContainingImportantShipmentData',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentContainingImportantShipmentData')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.documentShipmentDate',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.documentShipmentDate')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.docViaFraudReporter',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.docViaFraudReporter')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.duplicateProcessing',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.duplicateProcessing')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.duplicateProcessingHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.duplicateProcessingHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.evidenceCardHolderParticipation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.evidenceCardHolderParticipation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.evidenceProofingParticipationOfCardholder',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.evidenceProofingParticipationOfCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.evidenceTransactionWasRecurring',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.evidenceTransactionWasRecurring')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.expiredCard',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.expiredCard')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.expiredCardHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.expiredCardHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.explanation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.explanation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.explanationWhyCancellationCodeInvalid',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.explanationWhyCancellationCodeInvalid')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.falseTransaction',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.falseTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.firstChargebackNumberAndDate',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.firstChargebackNumberAndDate')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightManifest',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightManifest')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightManifestShowingCardholderName',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightManifestShowingCardholderName')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightTicket',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightTicket')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightTicketUsed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightTicketUsed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightTicketWithCardholderName',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightTicketWithCardholderName')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.flightTookPlace',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.flightTookPlace')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.frequentFlyerInformation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.frequentFlyerInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.ifDelayedProofShowingMerchantAbleToProvideServices',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.ifDelayedProofShowingMerchantAbleToProvideServices')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.incorrectAmount',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.incorrectAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.latePresentment',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.latePresentment')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.latePresentmentHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.latePresentmentHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.latestRecurringTransactions',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.latestRecurringTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.memberMessageText',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.memberMessageText')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.memberMessageTextSentToSchemes',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.memberMessageTextSentToSchemes')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchandiseDescription',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchandiseDescription')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchandiseNotAsDescribed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchandiseNotAsDescribed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchandiseNotReceived',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchandiseNotReceived')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchandiseNotReceivedHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchandiseNotReceivedHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchandiseSentToAvsConfirmedBillingAddress',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchandiseSentToAvsConfirmedBillingAddress')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchantFraudPerformanceProgram',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchantFraudPerformanceProgram')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchantFraudPerformanceProgramHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchantFraudPerformanceProgramHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchantObtainedCardAtTimeReservationMade',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchantObtainedCardAtTimeReservationMade')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.merchantWrittenRebuttal',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.merchantWrittenRebuttal')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.missingSignature',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.missingSignature')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.missingSignatureHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.missingSignatureHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.moreThanOneTransactionProcessed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.moreThanOneTransactionProcessed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.mpiData',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.mpiData')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.nonMatchingAccountNumber',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.nonMatchingAccountNumber')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.nonMatchingAccountNumberHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.nonMatchingAccountNumberHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.noNotification',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.noNotification')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.numberAndDateOfOriginalChargeback',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.numberAndDateOfOriginalChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.originalAmount',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.originalAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.originalAmountIfDisputedRepresentsPartialShipment',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.originalAmountIfDisputedRepresentsPartialShipment')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.other',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.other')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.otherHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.otherHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.paidByOtherMeansThanJCBCard',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.paidByOtherMeansThanJCBCard')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.paidByOtherMeansThanJCBCardHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.paidByOtherMeansThanJCBCardHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.paperAirlineTicket',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.paperAirlineTicket')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.passengerId',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.passengerId')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.passengerIdLinkedToCardholder',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.passengerIdLinkedToCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.previousTransactionsNotDisputed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.previousTransactionsNotDisputed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.printedSignedReceipt',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.printedSignedReceipt')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.processingError',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.processingError')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.processingErrorHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.processingErrorHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofAirlineTicketsWereUsed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofAirlineTicketsWereUsed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofCardAndCardholderSignature',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofCardAndCardholderSignature')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofCardPresence',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofCardPresence')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofFlightTookPlace',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofFlightTookPlace')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofGoodsServicesWereProvided',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofGoodsServicesWereProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofGoodsWereDeliveredAsDescribed',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofGoodsWereDeliveredAsDescribed')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofMerchantHadNotReceivedPreviousChargeback',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofMerchantHadNotReceivedPreviousChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofMerchantHadNotReceivedPreviousChargebackAutoGenerated',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofMerchantHadNotReceivedPreviousChargebackAutoGenerated')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofMerchantNotNotifiedOfCancellation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofMerchantNotNotifiedOfCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfAccountTakeover',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfAccountTakeover')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfAddendum',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfAddendum')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfDelayedDelivery',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfDelayedDelivery')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfFulfillment',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfFulfillment')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfInvalidChargeback',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfInvalidChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfNoCancellation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfNoCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfNoChargebackReceived',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfNoChargebackReceived')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfNoShow',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfNoShow')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfRecurringTransaction',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfRecurringTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfRefund',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfRefund')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofOfRetailSale',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofOfRetailSale')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofProvidedMerchandise',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofProvidedMerchandise')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofRecurringContractNotCancelledAtTimeOfSettlement',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofRecurringContractNotCancelledAtTimeOfSettlement')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofRenewedMembership',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofRenewedMembership')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofShowingCardholderRenewedMembership',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofShowingCardholderRenewedMembership')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofShowingTrackingInformation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofShowingTrackingInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.proofValidIncreaseOfAmount',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.proofValidIncreaseOfAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.provideRefundId',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.provideRefundId')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.provingTransactionResultedFromAccountTakeover',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.provingTransactionResultedFromAccountTakeover')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.reasonableAmount',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.reasonableAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.reasonForInvalidation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.reasonForInvalidation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.reasonForInvalidationOfChargeback',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.reasonForInvalidationOfChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.rebuttalCancellationNotAccepted',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.rebuttalCancellationNotAccepted')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.rebuttalGivenToCardholder',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.rebuttalGivenToCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.rebuttalStatingCancellationNotAccepted',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.rebuttalStatingCancellationNotAccepted')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.receiptOfFlightTicketAtBillingAddress',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.receiptOfFlightTicketAtBillingAddress')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.receiptOrOther',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.receiptOrOther')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.resultsOfMpiCalls',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.resultsOfMpiCalls')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.retrievalRequestFulfilled',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.retrievalRequestFulfilled')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.retrievalRequestNotHonored',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.retrievalRequestNotHonored')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.retrievalRequestNotHonoredHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.retrievalRequestNotHonoredHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.serviceNotRendered',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.serviceNotRendered')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.serviceNotRenderedHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.serviceNotRenderedHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.shipmentDocumentation',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.shipmentDocumentation')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.shipToAddress',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.shipToAddress')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.shipToAddressIfApplicable',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.shipToAddressIfApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.signatureOrChipPinEvidence',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.signatureOrChipPinEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.signedTerminalReceipt',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.signedTerminalReceipt')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.SplitSales',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.SplitSales')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.SplitSalesHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.SplitSalesHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.statementMerchantDidNotReceiveGoods',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.statementMerchantDidNotReceiveGoods')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.SupplementalDocumentsDetails',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.SupplementalDocumentsDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.SupplementalDocumentsTitle',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.SupplementalDocumentsTitle')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.TEDocumentDetails',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.TEDocumentDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.TEDocumentTitle',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.TEDocumentTitle')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionAfterReservationCancelled',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionAfterReservationCancelled')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionAfterReservationCancelledHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionAfterReservationCancelledHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionNotRecognizedChipLiabilityShift',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionNotRecognizedChipLiabilityShift')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionNotRecognizedChipLiabilityShiftHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionNotRecognizedChipLiabilityShiftHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionNotRecognizedContactlessAndCardNotPresented',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionNotRecognizedContactlessAndCardNotPresented')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.transactionNotRecognizedContactlessAndCardNotPresentedHelp',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.transactionNotRecognizedContactlessAndCardNotPresentedHelp')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.unauthorisedReason',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.unauthorisedReason')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.uploadListOfRefundIds',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.uploadListOfRefundIds')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.writtenCorrespondenceExchanged',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.writtenCorrespondenceExchanged')],
        },
        {
            publicKey: 'disputes.management.common.defenseDocuments.writtenRebutalGoodsRepairedOrReplaced',
            targets: [disputesTarget('disputes.management.common.defenseDocuments.writtenRebutalGoodsRepairedOrReplaced')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.3dSecureFullyAuthenticatedTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.3dSecureFullyAuthenticatedTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.3dSecureLiabilityShiftNotFullyAuthenticated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.3dSecureLiabilityShiftNotFullyAuthenticated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.accountNumberNotListedInExceptions',
            targets: [disputesTarget('disputes.management.common.defenseReasons.accountNumberNotListedInExceptions')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.accountNumberNotListedInExceptionsFor60Days',
            targets: [disputesTarget('disputes.management.common.defenseReasons.accountNumberNotListedInExceptionsFor60Days')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.accountTakeover',
            targets: [disputesTarget('disputes.management.common.defenseReasons.accountTakeover')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.acquirerDefendChargebackIfIssuerRequested',
            targets: [disputesTarget('disputes.management.common.defenseReasons.acquirerDefendChargebackIfIssuerRequested')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.acquirerProvidesCorrectDateWithinTimeLimit',
            targets: [disputesTarget('disputes.management.common.defenseReasons.acquirerProvidesCorrectDateWithinTimeLimit')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.additionalInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.additionalInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.addressMerchandiseSentAvsConfirmed',
            targets: [disputesTarget('disputes.management.common.defenseReasons.addressMerchandiseSentAvsConfirmed')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.addressVerificationService',
            targets: [disputesTarget('disputes.management.common.defenseReasons.addressVerificationService')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.addressVerificationServiceAdditionalInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.addressVerificationServiceAdditionalInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.airlineCompellingEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.airlineCompellingEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.airlineFlightProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.airlineFlightProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.atmDispute',
            targets: [disputesTarget('disputes.management.common.defenseReasons.atmDispute')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.authorisationReceivedForAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.authorisationReceivedForAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.authorisedOnline',
            targets: [disputesTarget('disputes.management.common.defenseReasons.authorisedOnline')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.autoGeneratedRecurringTransactionDetails',
            targets: [disputesTarget('disputes.management.common.defenseReasons.autoGeneratedRecurringTransactionDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.autoResponseSentToIssuer',
            targets: [disputesTarget('disputes.management.common.defenseReasons.autoResponseSentToIssuer')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.autoResponseToRfi',
            targets: [disputesTarget('disputes.management.common.defenseReasons.autoResponseToRfi')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.buyerExceededWindowToFileReturn',
            targets: [disputesTarget('disputes.management.common.defenseReasons.buyerExceededWindowToFileReturn')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cancellationCodeWasInvalidAsShownByExplanationProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cancellationCodeWasInvalidAsShownByExplanationProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cancellationContractFailed',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cancellationContractFailed')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cancellationOrReturns',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cancellationOrReturns')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardAndSignatureForCorporateFleetCardTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardAndSignatureForCorporateFleetCardTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderAgreedToAmountAsReasonable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderAgreedToAmountAsReasonable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderBilledForSeparateAdditionalAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderBilledForSeparateAdditionalAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderCancelledRecurringServiceButRenewedLater',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderCancelledRecurringServiceButRenewedLater')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderDidNotMeetCancellationTerms',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderDidNotMeetCancellationTerms')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderNotifiedBeforeRecurringTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderNotifiedBeforeRecurringTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderNotifiedButNoReply',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderNotifiedButNoReply')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderParticipated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderParticipated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderResponsibleForAddendumTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderResponsibleForAddendumTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderResponsibleForDisputedAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderResponsibleForDisputedAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardholderShouldHaveReturnedGoods',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardholderShouldHaveReturnedGoods')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardPresenceProof',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardPresenceProof')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardPresentAndChipUsedNoPinProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardPresentAndChipUsedNoPinProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cardWithSignatureNotProcessedMastercardNetwork',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cardWithSignatureNotProcessedMastercardNetwork')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cbCodeNotApplicable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cbCodeNotApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chargebackBundlingInvalid',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chargebackBundlingInvalid')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chargebackCodeNA3dSecureNotOffered',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chargebackCodeNA3dSecureNotOffered')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chargebackInvalidCorrectAmountAndCurrencyProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chargebackInvalidCorrectAmountAndCurrencyProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chargebackReceivedAfterMastercardTimeLimit',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chargebackReceivedAfterMastercardTimeLimit')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chipLiabilityShift',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chipLiabilityShift')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chipTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chipTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.chipTransactionReportedSAFE',
            targets: [disputesTarget('disputes.management.common.defenseReasons.chipTransactionReportedSAFE')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.claimNotJustifiedSinceTransactionNotChargebacked',
            targets: [disputesTarget('disputes.management.common.defenseReasons.claimNotJustifiedSinceTransactionNotChargebacked')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.compellingEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.compellingEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.compellingEvidenceRecurringTransactions',
            targets: [disputesTarget('disputes.management.common.defenseReasons.compellingEvidenceRecurringTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.correctTransactionAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.correctTransactionAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.correctTransactionCurrency',
            targets: [disputesTarget('disputes.management.common.defenseReasons.correctTransactionCurrency')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.correctTransactionDateProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.correctTransactionDateProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.creditOrCancellationPolicyDisclosed',
            targets: [disputesTarget('disputes.management.common.defenseReasons.creditOrCancellationPolicyDisclosed')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.creditOrCancellationPolicyDisclosedToCardholder',
            targets: [disputesTarget('disputes.management.common.defenseReasons.creditOrCancellationPolicyDisclosedToCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.creditPreviouslyIssued',
            targets: [disputesTarget('disputes.management.common.defenseReasons.creditPreviouslyIssued')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.cvc2ValidationProgram',
            targets: [disputesTarget('disputes.management.common.defenseReasons.cvc2ValidationProgram')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.de22DontMatchInFaceToFaceTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.de22DontMatchInFaceToFaceTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.defenseReasonIfProblemsWithScans',
            targets: [disputesTarget('disputes.management.common.defenseReasons.defenseReasonIfProblemsWithScans')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.deficiencyCorrected',
            targets: [disputesTarget('disputes.management.common.defenseReasons.deficiencyCorrected')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.delayInSubmittingTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.delayInSubmittingTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.disputedSurcharge',
            targets: [disputesTarget('disputes.management.common.defenseReasons.disputedSurcharge')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.disputedSurchargeIncorrectCalculation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.disputedSurchargeIncorrectCalculation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.docToProveNoPaymentByOtherMean',
            targets: [disputesTarget('disputes.management.common.defenseReasons.docToProveNoPaymentByOtherMean')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.documentationIncreasedDebitCardholderAccount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.documentationIncreasedDebitCardholderAccount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.documentationReceivedWasIllegible',
            targets: [disputesTarget('disputes.management.common.defenseReasons.documentationReceivedWasIllegible')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.documentsSentToFulfillRetrievalRequest',
            targets: [disputesTarget('disputes.management.common.defenseReasons.documentsSentToFulfillRetrievalRequest')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.duplicateChargeback',
            targets: [disputesTarget('disputes.management.common.defenseReasons.duplicateChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.emergencyPaymentAuthorizationService',
            targets: [disputesTarget('disputes.management.common.defenseReasons.emergencyPaymentAuthorizationService')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.emvDeviceNonEmvCard',
            targets: [disputesTarget('disputes.management.common.defenseReasons.emvDeviceNonEmvCard')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.emvLiabilityShift',
            targets: [disputesTarget('disputes.management.common.defenseReasons.emvLiabilityShift')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.evidenceCardholderAuthorizedTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.evidenceCardholderAuthorizedTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.evidenceGoodsNotDamaged',
            targets: [disputesTarget('disputes.management.common.defenseReasons.evidenceGoodsNotDamaged')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.evidenceServicesProvidedAndReceivedWrittenCorrespondence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.evidenceServicesProvidedAndReceivedWrittenCorrespondence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.evidenceThatCardholderParticipated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.evidenceThatCardholderParticipated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.faceToFaceTransactionNoConflictingInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.faceToFaceTransactionNoConflictingInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.faceToFaceTransactionWithConflictingInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.faceToFaceTransactionWithConflictingInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.fallbackDefenseReasonCode',
            targets: [disputesTarget('disputes.management.common.defenseReasons.fallbackDefenseReasonCode')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.firstChargebackCodeNotApplicable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.firstChargebackCodeNotApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.firstChargebackDoesNotMeetPrerequisites',
            targets: [disputesTarget('disputes.management.common.defenseReasons.firstChargebackDoesNotMeetPrerequisites')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.firstChargebackInvalid',
            targets: [disputesTarget('disputes.management.common.defenseReasons.firstChargebackInvalid')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.formatCbmmddyyArdXxxExpected',
            targets: [disputesTarget('disputes.management.common.defenseReasons.formatCbmmddyyArdXxxExpected')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.formatMultipleTransactionsNnnExpected',
            targets: [disputesTarget('disputes.management.common.defenseReasons.formatMultipleTransactionsNnnExpected')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.formatRpcsMmddyyExpected',
            targets: [disputesTarget('disputes.management.common.defenseReasons.formatRpcsMmddyyExpected')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.fraudEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.fraudEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.goodsNotReturned',
            targets: [disputesTarget('disputes.management.common.defenseReasons.goodsNotReturned')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.goodsOrServicesProvided',
            targets: [disputesTarget('disputes.management.common.defenseReasons.goodsOrServicesProvided')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.goodsRepairedOrReplaced',
            targets: [disputesTarget('disputes.management.common.defenseReasons.goodsRepairedOrReplaced')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.goodsWereAsDescribed',
            targets: [disputesTarget('disputes.management.common.defenseReasons.goodsWereAsDescribed')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.goodsWereRepairedOrReplaced',
            targets: [disputesTarget('disputes.management.common.defenseReasons.goodsWereRepairedOrReplaced')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.identifiedAddendum',
            targets: [disputesTarget('disputes.management.common.defenseReasons.identifiedAddendum')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.increasedTransactionAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.increasedTransactionAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.intraregionalTransactionReportedSAFE',
            targets: [disputesTarget('disputes.management.common.defenseReasons.intraregionalTransactionReportedSAFE')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidAcquirerReferenceData',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidAcquirerReferenceData')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidCancellationCode',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidCancellationCode')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidChargeback',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidChargeback')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidChargebackBasedOnMcc',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidChargebackBasedOnMcc')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidChargebackReasonCode',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidChargebackReasonCode')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidMessageText',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidMessageText')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.invalidReferenceDataDocumentationNotRequired',
            targets: [disputesTarget('disputes.management.common.defenseReasons.invalidReferenceDataDocumentationNotRequired')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.issuerDidNotIncludeTwoSetsOfArns',
            targets: [disputesTarget('disputes.management.common.defenseReasons.issuerDidNotIncludeTwoSetsOfArns')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.issuerDidNotProvideRequiredDocumentation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.issuerDidNotProvideRequiredDocumentation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.issuerHasInitiatedTooManyFraudulentDisputes',
            targets: [disputesTarget('disputes.management.common.defenseReasons.issuerHasInitiatedTooManyFraudulentDisputes')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.issuerProcessedChargebackMoreThanOnce',
            targets: [disputesTarget('disputes.management.common.defenseReasons.issuerProcessedChargebackMoreThanOnce')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.justifiedDelayedPresentment',
            targets: [disputesTarget('disputes.management.common.defenseReasons.justifiedDelayedPresentment')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.liabilityShiftFullAuthenticated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.liabilityShiftFullAuthenticated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.manyFraudulentChargebacks',
            targets: [disputesTarget('disputes.management.common.defenseReasons.manyFraudulentChargebacks')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.membershipRenewedAfterCancellation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.membershipRenewedAfterCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchandiseNotReturned',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchandiseNotReturned')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchandiseWasNotCounterfeit',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchandiseWasNotCounterfeit')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchandiseWasReceivedByShopper',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchandiseWasReceivedByShopper')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantCanProvideAdditionalCompellingEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantCanProvideAdditionalCompellingEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantCanProvideAdditionalInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantCanProvideAdditionalInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantCantReceiveThisChargebackBasedOnTheirMcc',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantCantReceiveThisChargebackBasedOnTheirMcc')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantNotNotifiedOfCancellation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantNotNotifiedOfCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantProvidedServicesToCardholderProof',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantProvidedServicesToCardholderProof')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.merchantProvideMissingDocuments',
            targets: [disputesTarget('disputes.management.common.defenseReasons.merchantProvideMissingDocuments')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.noCreditSlip',
            targets: [disputesTarget('disputes.management.common.defenseReasons.noCreditSlip')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.noPriorChargebackReceived',
            targets: [disputesTarget('disputes.management.common.defenseReasons.noPriorChargebackReceived')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.noShowTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.noShowTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.not3dSecureTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.not3dSecureTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.notAgreeWithRefund',
            targets: [disputesTarget('disputes.management.common.defenseReasons.notAgreeWithRefund')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.notPosTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.notPosTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.parcelServiceReceipt',
            targets: [disputesTarget('disputes.management.common.defenseReasons.parcelServiceReceipt')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.pastChargebackTimeLimit',
            targets: [disputesTarget('disputes.management.common.defenseReasons.pastChargebackTimeLimit')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.paymentByOtherMeans',
            targets: [disputesTarget('disputes.management.common.defenseReasons.paymentByOtherMeans')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.paypassAmountBelowProtectionAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.paypassAmountBelowProtectionAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.paypassTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.paypassTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.pinForOneOrBothTransactions',
            targets: [disputesTarget('disputes.management.common.defenseReasons.pinForOneOrBothTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.pinTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.pinTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.pinUsedToVerifyCardholder',
            targets: [disputesTarget('disputes.management.common.defenseReasons.pinUsedToVerifyCardholder')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.posTransactionAndSignedTerminalReceiptAvailable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.posTransactionAndSignedTerminalReceiptAvailable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.posTransactionCardholderWasPresentProof',
            targets: [disputesTarget('disputes.management.common.defenseReasons.posTransactionCardholderWasPresentProof')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.prevChargedbackTwoTransactionsWithSameAccount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.prevChargedbackTwoTransactionsWithSameAccount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.previousChargebackCancellingRecurringContract',
            targets: [disputesTarget('disputes.management.common.defenseReasons.previousChargebackCancellingRecurringContract')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.proofCardholderReceivedMerchandise',
            targets: [disputesTarget('disputes.management.common.defenseReasons.proofCardholderReceivedMerchandise')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.proofDeficiencyCorrected',
            targets: [disputesTarget('disputes.management.common.defenseReasons.proofDeficiencyCorrected')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.proofOfCardPresenceAvailableNotAuthorisedMastercardNetwork',
            targets: [disputesTarget('disputes.management.common.defenseReasons.proofOfCardPresenceAvailableNotAuthorisedMastercardNetwork')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.proofOfCardPresenceMastercardCorporateFleet',
            targets: [disputesTarget('disputes.management.common.defenseReasons.proofOfCardPresenceMastercardCorporateFleet')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.provideInformationForCollectionOrFraudCase',
            targets: [disputesTarget('disputes.management.common.defenseReasons.provideInformationForCollectionOrFraudCase')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.provideMissingInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.provideMissingInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.provideTransactionalInformation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.provideTransactionalInformation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.provideTransactionalInfoTravelDetails',
            targets: [disputesTarget('disputes.management.common.defenseReasons.provideTransactionalInfoTravelDetails')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.purchaseProperlyPosted',
            targets: [disputesTarget('disputes.management.common.defenseReasons.purchaseProperlyPosted')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.qpsTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.qpsTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.qpsTransactionWithAmountLessThanChargebackProtectionAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.qpsTransactionWithAmountLessThanChargebackProtectionAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.receiptWithItemsBilledBecauseOfLossTheftDamages',
            targets: [disputesTarget('disputes.management.common.defenseReasons.receiptWithItemsBilledBecauseOfLossTheftDamages')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.recurringTransactionCompellingEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.recurringTransactionCompellingEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.recurringTransactionCompellingMerchantEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.recurringTransactionCompellingMerchantEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.reponseToRfi',
            targets: [disputesTarget('disputes.management.common.defenseReasons.reponseToRfi')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.reponseToRfiCardPresent',
            targets: [disputesTarget('disputes.management.common.defenseReasons.reponseToRfiCardPresent')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.requiredDocumentationNotReceived',
            targets: [disputesTarget('disputes.management.common.defenseReasons.requiredDocumentationNotReceived')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.responseToRfiAirlines',
            targets: [disputesTarget('disputes.management.common.defenseReasons.responseToRfiAirlines')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.responseToRfiCarRental',
            targets: [disputesTarget('disputes.management.common.defenseReasons.responseToRfiCarRental')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.retrievalRequestFulfilled',
            targets: [disputesTarget('disputes.management.common.defenseReasons.retrievalRequestFulfilled')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.returnNotAccepted',
            targets: [disputesTarget('disputes.management.common.defenseReasons.returnNotAccepted')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.scanningError',
            targets: [disputesTarget('disputes.management.common.defenseReasons.scanningError')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.serviceCancelledButMerchantNotNotified',
            targets: [disputesTarget('disputes.management.common.defenseReasons.serviceCancelledButMerchantNotNotified')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.serviceNotCancelled',
            targets: [disputesTarget('disputes.management.common.defenseReasons.serviceNotCancelled')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.serviceNotCancelledEvidence',
            targets: [disputesTarget('disputes.management.common.defenseReasons.serviceNotCancelledEvidence')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.servicesProvidedAfterCancellation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.servicesProvidedAfterCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.servicesProvidedAndUsedAfterCancellation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.servicesProvidedAndUsedAfterCancellation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.shopperClaimsRefundWasPromisedButNotExecuted',
            targets: [disputesTarget('disputes.management.common.defenseReasons.shopperClaimsRefundWasPromisedButNotExecuted')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.shopperUsedAirlineTicket',
            targets: [disputesTarget('disputes.management.common.defenseReasons.shopperUsedAirlineTicket')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.signedImprintedSalesSlipInvoicePosReceipt',
            targets: [disputesTarget('disputes.management.common.defenseReasons.signedImprintedSalesSlipInvoicePosReceipt')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.signedTerminalReceiptAvailable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.signedTerminalReceiptAvailable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.supplyDefenseMaterial',
            targets: [disputesTarget('disputes.management.common.defenseReasons.supplyDefenseMaterial')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.surchargeCorrectlyProcessed',
            targets: [disputesTarget('disputes.management.common.defenseReasons.surchargeCorrectlyProcessed')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.surchargeIncorrectlyCalculatedByIssuer',
            targets: [disputesTarget('disputes.management.common.defenseReasons.surchargeIncorrectlyCalculatedByIssuer')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.termsOfSaleWereNotMisrepresented',
            targets: [disputesTarget('disputes.management.common.defenseReasons.termsOfSaleWereNotMisrepresented')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.thisReasonIsTechnical',
            targets: [disputesTarget('disputes.management.common.defenseReasons.thisReasonIsTechnical')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.timeBetweenAuthorisationAndSettlementWithinTimeLimits',
            targets: [disputesTarget('disputes.management.common.defenseReasons.timeBetweenAuthorisationAndSettlementWithinTimeLimits')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactioAuthorisedEmergencyPaymentAuthorizationService',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactioAuthorisedEmergencyPaymentAuthorizationService')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionAmountAlreadyRefunded',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionAmountAlreadyRefunded')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionApproved3dSecureAuthenticated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionApproved3dSecureAuthenticated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionBetweenChipLiabilityShiftProgramCustomers',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionBetweenChipLiabilityShiftProgramCustomers')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionFallsCvc2ValidationProgram',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionFallsCvc2ValidationProgram')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionFromAccountTakeover',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionFromAccountTakeover')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionInformationDocument',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionInformationDocument')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionIssuerApproved3dSecureAuthenticated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionIssuerApproved3dSecureAuthenticated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionNotChargebackedAutoDefense',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionNotChargebackedAutoDefense')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionNotFully3dSecureAuthenticated',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionNotFully3dSecureAuthenticated')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionNotRecurring',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionNotRecurring')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionNotRecurringTransactionInstallment',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionNotRecurringTransactionInstallment')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionSettledWithinTimeLimit',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionSettledWithinTimeLimit')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionsInitiatedDueToLossTheftOrDamages',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionsInitiatedDueToLossTheftOrDamages')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasAuthorised',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasAuthorised')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasAuthorisedOnline',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasAuthorisedOnline')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasECommerceGivenChargebackReasonNotApplicable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasECommerceGivenChargebackReasonNotApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasInFaceToFaceEnvironment',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasInFaceToFaceEnvironment')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasProperlyIdentifiedAsInstallmentTransaction',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasProperlyIdentifiedAsInstallmentTransaction')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.transactionWasResultOfGuaranteedReservation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.transactionWasResultOfGuaranteedReservation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.twoDifferentTidsNonAtm',
            targets: [disputesTarget('disputes.management.common.defenseReasons.twoDifferentTidsNonAtm')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.twoDifferentTidsWithSameCardholderAccount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.twoDifferentTidsWithSameCardholderAccount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.twoDifferentTransactions',
            targets: [disputesTarget('disputes.management.common.defenseReasons.twoDifferentTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.twoPreviousFraudRelatedChargebacks',
            targets: [disputesTarget('disputes.management.common.defenseReasons.twoPreviousFraudRelatedChargebacks')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.twoSeparateTransactions',
            targets: [disputesTarget('disputes.management.common.defenseReasons.twoSeparateTransactions')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.unfoundedCardholderDispute',
            targets: [disputesTarget('disputes.management.common.defenseReasons.unfoundedCardholderDispute')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.unreasonableAmount',
            targets: [disputesTarget('disputes.management.common.defenseReasons.unreasonableAmount')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.uploadReturnPolicyDocument',
            targets: [disputesTarget('disputes.management.common.defenseReasons.uploadReturnPolicyDocument')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.useThisDefenseReasonIfApplicable',
            targets: [disputesTarget('disputes.management.common.defenseReasons.useThisDefenseReasonIfApplicable')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.validityOfTransactionChargedExplanation',
            targets: [disputesTarget('disputes.management.common.defenseReasons.validityOfTransactionChargedExplanation')],
        },
        {
            publicKey: 'disputes.management.common.defenseReasons.waiverFormAbsolvingMerchantResponsibility',
            targets: [disputesTarget('disputes.management.common.defenseReasons.waiverFormAbsolvingMerchantResponsibility')],
        },
        {
            publicKey: 'disputes.management.common.errors.notFound',
            targets: [disputesTarget('disputes.management.common.errors.notFound')],
        },
        {
            publicKey: 'disputes.management.common.errors.unavailable',
            targets: [disputesTarget('disputes.management.common.errors.unavailable')],
        },
        {
            publicKey: 'disputes.management.common.title',
            targets: [disputesTarget('disputes.management.common.title')],
        },
        {
            publicKey: 'disputes.management.defend.chargeback.feeInfo',
            targets: [disputesTarget('disputes.management.defend.chargeback.feeInfo')],
        },
        {
            publicKey: 'disputes.management.defend.chargeback.selectDefenseReason',
            targets: [disputesTarget('disputes.management.defend.chargeback.selectDefenseReason')],
        },
        {
            publicKey: 'disputes.management.defend.chargeback.submitSuccessInfo',
            targets: [disputesTarget('disputes.management.defend.chargeback.submitSuccessInfo')],
        },
        {
            publicKey: 'disputes.management.defend.chargeback.title',
            targets: [disputesTarget('disputes.management.defend.chargeback.title')],
        },
        {
            publicKey: 'disputes.management.defend.common.actions.addOptionalDocument',
            targets: [disputesTarget('disputes.management.defend.common.actions.addOptionalDocument')],
        },
        {
            publicKey: 'disputes.management.defend.common.actions.continue',
            targets: [disputesTarget('disputes.management.defend.common.actions.continue')],
        },
        {
            publicKey: 'disputes.management.defend.common.actions.deleteOptionalDocument',
            targets: [disputesTarget('disputes.management.defend.common.actions.deleteOptionalDocument')],
        },
        {
            publicKey: 'disputes.management.defend.common.actions.submit',
            targets: [disputesTarget('disputes.management.defend.common.actions.submit')],
        },
        {
            publicKey: 'disputes.management.defend.common.defended',
            targets: [disputesTarget('disputes.management.defend.common.defended')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentRequirements',
            targets: [disputesTarget('disputes.management.defend.common.documentRequirements')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentRequirements.formatAndSize',
            targets: [disputesTarget('disputes.management.defend.common.documentRequirements.formatAndSize')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentRequirements.language',
            targets: [disputesTarget('disputes.management.defend.common.documentRequirements.language')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentRequirements.recommendedSize',
            targets: [disputesTarget('disputes.management.defend.common.documentRequirements.recommendedSize')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentTypes.optional',
            targets: [disputesTarget('disputes.management.defend.common.documentTypes.optional')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentTypes.required',
            targets: [disputesTarget('disputes.management.defend.common.documentTypes.required')],
        },
        {
            publicKey: 'disputes.management.defend.common.documentUploadInfo',
            targets: [disputesTarget('disputes.management.defend.common.documentUploadInfo')],
        },
        {
            publicKey: 'disputes.management.defend.common.errors.defenseFailed',
            targets: [disputesTarget('disputes.management.defend.common.errors.defenseFailed')],
        },
        {
            publicKey: 'disputes.management.defend.common.errors.somethingWentWrong',
            targets: [disputesTarget('disputes.management.defend.common.errors.somethingWentWrong')],
        },
        {
            publicKey: 'disputes.management.defend.common.evidenceSubmitted',
            targets: [disputesTarget('disputes.management.defend.common.evidenceSubmitted')],
        },
        {
            publicKey: 'disputes.management.defend.common.inputs.documentSelect.a11y.label',
            targets: [disputesTarget('disputes.management.defend.common.inputs.documentSelect.a11y.label')],
        },
        {
            publicKey: 'disputes.management.defend.common.inputs.file.errors.default',
            targets: [disputesTarget('disputes.management.defend.common.inputs.file.errors.default')],
        },
        {
            publicKey: 'disputes.management.defend.common.inputs.file.errors.required',
            targets: [disputesTarget('disputes.management.defend.common.inputs.file.errors.required')],
        },
        {
            publicKey: 'disputes.management.defend.common.inputs.file.errors.tooLarge',
            targets: [disputesTarget('disputes.management.defend.common.inputs.file.errors.tooLarge')],
        },
        {
            publicKey: 'disputes.management.defend.common.inputs.reasonSelect.a11y.label',
            targets: [disputesTarget('disputes.management.defend.common.inputs.reasonSelect.a11y.label')],
        },
        {
            publicKey: 'disputes.management.defend.requestForInformation.selectDefenseReason',
            targets: [disputesTarget('disputes.management.defend.requestForInformation.selectDefenseReason')],
        },
        {
            publicKey: 'disputes.management.defend.requestForInformation.title',
            targets: [disputesTarget('disputes.management.defend.requestForInformation.title')],
        },
        {
            publicKey: 'disputes.management.details.actions.accept',
            targets: [disputesTarget('disputes.management.details.actions.accept')],
        },
        {
            publicKey: 'disputes.management.details.actions.contactSupport',
            targets: [disputesTarget('disputes.management.details.actions.contactSupport')],
        },
        {
            publicKey: 'disputes.management.details.actions.copyDisputeReference',
            targets: [disputesTarget('disputes.management.details.actions.copyDisputeReference')],
        },
        {
            publicKey: 'disputes.management.details.actions.copyMerchantReference',
            targets: [disputesTarget('disputes.management.details.actions.copyMerchantReference')],
        },
        {
            publicKey: 'disputes.management.details.actions.copyPaymentReference',
            targets: [disputesTarget('disputes.management.details.actions.copyPaymentReference')],
        },
        {
            publicKey: 'disputes.management.details.actions.defendChargeback',
            targets: [disputesTarget('disputes.management.details.actions.defendChargeback')],
        },
        {
            publicKey: 'disputes.management.details.actions.downloadEvidence',
            targets: [disputesTarget('disputes.management.details.actions.downloadEvidence')],
        },
        {
            publicKey: 'disputes.management.details.actions.submitInformation',
            targets: [disputesTarget('disputes.management.details.actions.submitInformation')],
        },
        {
            publicKey: 'disputes.management.details.alerts.autoDefended',
            targets: [disputesTarget('disputes.management.details.alerts.autoDefended')],
        },
        {
            publicKey: 'disputes.management.details.alerts.contactSupport.chargeback',
            targets: [disputesTarget('disputes.management.details.alerts.contactSupport.chargeback')],
        },
        {
            publicKey: 'disputes.management.details.alerts.contactSupport.notificationOfFraud',
            targets: [disputesTarget('disputes.management.details.alerts.contactSupport.notificationOfFraud')],
        },
        {
            publicKey: 'disputes.management.details.alerts.contactSupport.requestForInformation',
            targets: [disputesTarget('disputes.management.details.alerts.contactSupport.requestForInformation')],
        },
        {
            publicKey: 'disputes.management.details.alerts.notDefendable',
            targets: [disputesTarget('disputes.management.details.alerts.notDefendable')],
        },
        {
            publicKey: 'disputes.management.details.alerts.notDefendedExpired',
            targets: [disputesTarget('disputes.management.details.alerts.notDefendedExpired')],
        },
        {
            publicKey: 'disputes.management.details.alerts.notDefendedLost',
            targets: [disputesTarget('disputes.management.details.alerts.notDefendedLost')],
        },
        {
            publicKey: 'disputes.management.details.alerts.responseDeadline',
            targets: [disputesTarget('disputes.management.details.alerts.responseDeadline')],
        },
        {
            publicKey: 'disputes.management.details.errors.downloadFailure',
            targets: [disputesTarget('disputes.management.details.errors.downloadFailure')],
        },
        {
            publicKey: 'disputes.management.details.fields.acceptedOn',
            targets: [disputesTarget('disputes.management.details.fields.acceptedOn')],
        },
        {
            publicKey: 'disputes.management.details.fields.account',
            targets: [disputesTarget('disputes.management.details.fields.account')],
        },
        {
            publicKey: 'disputes.management.details.fields.defendedOn',
            targets: [disputesTarget('disputes.management.details.fields.defendedOn')],
        },
        {
            publicKey: 'disputes.management.details.fields.defenseReason',
            targets: [disputesTarget('disputes.management.details.fields.defenseReason')],
        },
        {
            publicKey: 'disputes.management.details.fields.disputeReason',
            targets: [disputesTarget('disputes.management.details.fields.disputeReason')],
        },
        {
            publicKey: 'disputes.management.details.fields.disputeReference',
            targets: [disputesTarget('disputes.management.details.fields.disputeReference')],
        },
        {
            publicKey: 'disputes.management.details.fields.evidence',
            targets: [disputesTarget('disputes.management.details.fields.evidence')],
        },
        {
            publicKey: 'disputes.management.details.fields.expiredOn',
            targets: [disputesTarget('disputes.management.details.fields.expiredOn')],
        },
        {
            publicKey: 'disputes.management.details.fields.merchantReference',
            targets: [disputesTarget('disputes.management.details.fields.merchantReference')],
        },
        {
            publicKey: 'disputes.management.details.fields.openedOn',
            targets: [disputesTarget('disputes.management.details.fields.openedOn')],
        },
        {
            publicKey: 'disputes.management.details.fields.paymentReference',
            targets: [disputesTarget('disputes.management.details.fields.paymentReference')],
        },
        {
            publicKey: 'disputes.management.details.fields.reasonCode',
            targets: [disputesTarget('disputes.management.details.fields.reasonCode')],
        },
        {
            publicKey: 'disputes.management.details.fields.respondBy',
            targets: [disputesTarget('disputes.management.details.fields.respondBy')],
        },
        {
            publicKey: 'disputes.management.details.issuerComment',
            targets: [disputesTarget('disputes.management.details.issuerComment')],
        },
        {
            publicKey: 'disputes.management.details.issuerComment.showLess',
            targets: [disputesTarget('disputes.management.details.issuerComment.showLess')],
        },
        {
            publicKey: 'disputes.management.details.issuerComment.showMore',
            targets: [disputesTarget('disputes.management.details.issuerComment.showMore')],
        },
        {
            publicKey: 'disputes.management.details.types.chargeback',
            targets: [disputesTarget('disputes.management.details.types.chargeback')],
        },
        {
            publicKey: 'disputes.management.details.types.notificationOfFraud',
            targets: [disputesTarget('disputes.management.details.types.notificationOfFraud')],
        },
        {
            publicKey: 'disputes.management.details.types.requestForInformation',
            targets: [disputesTarget('disputes.management.details.types.requestForInformation')],
        },
        {
            publicKey: 'disputes.overview.chargebacks.errors.listEmpty',
            targets: [disputesTarget('disputes.overview.chargebacks.errors.listEmpty')],
        },
        {
            publicKey: 'disputes.overview.chargebacks.errors.updateFilters',
            targets: [disputesTarget('disputes.overview.chargebacks.errors.updateFilters')],
        },
        {
            publicKey: 'disputes.overview.chargebacks.limitSelect.a11y.label',
            targets: [disputesTarget('disputes.overview.chargebacks.limitSelect.a11y.label')],
        },
        {
            publicKey: 'disputes.overview.common.actionNeeded.dueDate',
            targets: [disputesTarget('disputes.overview.common.actionNeeded.dueDate')],
        },
        {
            publicKey: 'disputes.overview.common.actionNeeded.respondDays',
            targets: [disputesTarget('disputes.overview.common.actionNeeded.respondDays')],
        },
        {
            publicKey: 'disputes.overview.common.actionNeeded.respondToday',
            targets: [disputesTarget('disputes.overview.common.actionNeeded.respondToday')],
        },
        {
            publicKey: 'disputes.overview.common.errors.listUnavailable',
            targets: [disputesTarget('disputes.overview.common.errors.listUnavailable')],
        },
        {
            publicKey: 'disputes.overview.common.errors.unavailable',
            targets: [disputesTarget('disputes.overview.common.errors.unavailable')],
        },
        {
            publicKey: 'disputes.overview.common.fields.currency',
            targets: [disputesTarget('disputes.overview.common.fields.currency')],
        },
        {
            publicKey: 'disputes.overview.common.fields.disputedAmount',
            targets: [disputesTarget('disputes.overview.common.fields.disputedAmount')],
        },
        {
            publicKey: 'disputes.overview.common.fields.disputeReason',
            targets: [disputesTarget('disputes.overview.common.fields.disputeReason')],
        },
        {
            publicKey: 'disputes.overview.common.fields.disputeReasonLabel',
            targets: [disputesTarget('disputes.overview.common.fields.disputeReasonLabel')],
        },
        {
            publicKey: 'disputes.overview.common.fields.openedOn',
            targets: [disputesTarget('disputes.overview.common.fields.openedOn')],
        },
        {
            publicKey: 'disputes.overview.common.fields.paymentMethod',
            targets: [disputesTarget('disputes.overview.common.fields.paymentMethod')],
        },
        {
            publicKey: 'disputes.overview.common.fields.reason',
            targets: [disputesTarget('disputes.overview.common.fields.reason')],
        },
        {
            publicKey: 'disputes.overview.common.fields.respondBy',
            targets: [disputesTarget('disputes.overview.common.fields.respondBy')],
        },
        {
            publicKey: 'disputes.overview.common.fields.status',
            targets: [disputesTarget('disputes.overview.common.fields.status')],
        },
        {
            publicKey: 'disputes.overview.common.fields.totalPaymentAmount',
            targets: [disputesTarget('disputes.overview.common.fields.totalPaymentAmount')],
        },
        {
            publicKey: 'disputes.overview.common.filters.a11y.label',
            targets: [disputesTarget('disputes.overview.common.filters.a11y.label')],
        },
        {
            publicKey: 'disputes.overview.common.filters.types.disputeReason',
            targets: [disputesTarget('disputes.overview.common.filters.types.disputeReason')],
        },
        {
            publicKey: 'disputes.overview.common.filters.types.disputeReasonLabel',
            targets: [disputesTarget('disputes.overview.common.filters.types.disputeReasonLabel')],
        },
        {
            publicKey: 'disputes.overview.common.filters.types.paymentMethod',
            targets: [disputesTarget('disputes.overview.common.filters.types.paymentMethod')],
        },
        {
            publicKey: 'disputes.overview.common.filters.types.statusGroup',
            targets: [disputesTarget('disputes.overview.common.filters.types.statusGroup')],
        },
        {
            publicKey: 'disputes.overview.common.pagination.a11y.label',
            targets: [disputesTarget('disputes.overview.common.pagination.a11y.label')],
        },
        {
            publicKey: 'disputes.overview.common.statusGroups.chargebacks',
            targets: [disputesTarget('disputes.overview.common.statusGroups.chargebacks')],
        },
        {
            publicKey: 'disputes.overview.common.statusGroups.fraudAlerts',
            targets: [disputesTarget('disputes.overview.common.statusGroups.fraudAlerts')],
        },
        {
            publicKey: 'disputes.overview.common.statusGroups.ongoingAndClosed',
            targets: [disputesTarget('disputes.overview.common.statusGroups.ongoingAndClosed')],
        },
        {
            publicKey: 'disputes.overview.common.title',
            targets: [disputesTarget('disputes.overview.common.title')],
        },
        {
            publicKey: 'disputes.overview.fraudAlerts.errors.listEmpty',
            targets: [disputesTarget('disputes.overview.fraudAlerts.errors.listEmpty')],
        },
        {
            publicKey: 'disputes.overview.fraudAlerts.errors.updateFilters',
            targets: [disputesTarget('disputes.overview.fraudAlerts.errors.updateFilters')],
        },
        {
            publicKey: 'disputes.overview.fraudAlerts.limitSelect.a11y.label',
            targets: [disputesTarget('disputes.overview.fraudAlerts.limitSelect.a11y.label')],
        },
        {
            publicKey: 'disputes.overview.ongoingAndClosed.errors.listEmpty',
            targets: [disputesTarget('disputes.overview.ongoingAndClosed.errors.listEmpty')],
        },
        {
            publicKey: 'disputes.overview.ongoingAndClosed.errors.updateFilters',
            targets: [disputesTarget('disputes.overview.ongoingAndClosed.errors.updateFilters')],
        },
        {
            publicKey: 'disputes.overview.ongoingAndClosed.limitSelect.a11y.label',
            targets: [disputesTarget('disputes.overview.ongoingAndClosed.limitSelect.a11y.label')],
        },
        {
            publicKey: 'common.actions.dismiss.labels.close',
            targets: [
                bentoTarget('bento.alert.close'),
                bentoTarget('bento.base.modal.close'),
                disputesTarget('disputes.actions.dismiss.labels.close'),
                transactionsTarget('transactions.actions.dismiss.labels.close'),
            ],
        },
        {
            publicKey: 'common.actions.apply.labels.default',
            targets: [
                bentoTarget('bento.date.range.picker.apply'),
                disputesTarget('disputes.actions.apply.labels.default'),
                transactionsTarget('transactions.actions.apply.labels.default'),
            ],
        },
        {
            publicKey: 'common.actions.cancel.labels.default',
            placeholders: [],
            targets: [bentoTarget('bento.date.range.picker.cancel')],
        },
        {
            publicKey: 'common.states.loading',
            placeholders: [],
            targets: [bentoTarget('bento.data.grid.loading')],
        },
        {
            publicKey: 'common.errors.noResults',
            targets: [
                bentoTarget('bento.data.grid.noResults'),
                bentoTarget('bento.data.grid.lazy.load.noResults'),
                disputesTarget('disputes.errors.noResults'),
                transactionsTarget('transactions.errors.noResults'),
            ],
        },
        {
            publicKey: 'common.pagination.controls.nextPage.label',
            targets: [
                bentoTarget('bento.pagination.controls.navigateToTheNextPage'),
                disputesTarget('disputes.pagination.controls.nextPage.label'),
                transactionsTarget('transactions.pagination.controls.nextPage.label'),
            ],
        },
        {
            publicKey: 'common.pagination.controls.previousPage.label',
            targets: [
                bentoTarget('bento.pagination.controls.navigateToThePreviousPage'),
                disputesTarget('disputes.pagination.controls.previousPage.label'),
                transactionsTarget('transactions.pagination.controls.previousPage.label'),
            ],
        },
        {
            publicKey: 'transactions.common.statuses.Booked',
            targets: [transactionsTarget('transactions.common.statuses.Booked')],
        },
        {
            publicKey: 'transactions.common.statuses.Pending',
            targets: [transactionsTarget('transactions.common.statuses.Pending')],
        },
        {
            publicKey: 'transactions.common.statuses.Reversed',
            targets: [transactionsTarget('transactions.common.statuses.Reversed')],
        },
        {
            publicKey: 'transactions.common.types.ATM',
            targets: [transactionsTarget('transactions.common.types.ATM')],
        },
        {
            publicKey: 'transactions.common.types.ATM.description',
            targets: [transactionsTarget('transactions.common.types.ATM.description')],
        },
        {
            publicKey: 'transactions.common.types.Capital',
            targets: [transactionsTarget('transactions.common.types.Capital')],
        },
        {
            publicKey: 'transactions.common.types.Capital.description',
            targets: [transactionsTarget('transactions.common.types.Capital.description')],
        },
        {
            publicKey: 'transactions.common.types.Chargeback',
            targets: [transactionsTarget('transactions.common.types.Chargeback')],
        },
        {
            publicKey: 'transactions.common.types.Chargeback.description',
            targets: [transactionsTarget('transactions.common.types.Chargeback.description')],
        },
        {
            publicKey: 'transactions.common.types.Correction',
            targets: [transactionsTarget('transactions.common.types.Correction')],
        },
        {
            publicKey: 'transactions.common.types.Correction.description',
            targets: [transactionsTarget('transactions.common.types.Correction.description')],
        },
        {
            publicKey: 'transactions.common.types.Fee',
            targets: [transactionsTarget('transactions.common.types.Fee')],
        },
        {
            publicKey: 'transactions.common.types.Fee.description',
            targets: [transactionsTarget('transactions.common.types.Fee.description')],
        },
        {
            publicKey: 'transactions.common.types.Other',
            targets: [transactionsTarget('transactions.common.types.Other')],
        },
        {
            publicKey: 'transactions.common.types.Other.description',
            targets: [transactionsTarget('transactions.common.types.Other.description')],
        },
        {
            publicKey: 'transactions.common.types.Payment',
            targets: [transactionsTarget('transactions.common.types.Payment')],
        },
        {
            publicKey: 'transactions.common.types.Payment.description',
            targets: [transactionsTarget('transactions.common.types.Payment.description')],
        },
        {
            publicKey: 'transactions.common.types.Refund',
            targets: [transactionsTarget('transactions.common.types.Refund')],
        },
        {
            publicKey: 'transactions.common.types.Refund.description',
            targets: [transactionsTarget('transactions.common.types.Refund.description')],
        },
        {
            publicKey: 'transactions.common.types.Transfer',
            targets: [transactionsTarget('transactions.common.types.Transfer')],
        },
        {
            publicKey: 'transactions.common.types.Transfer.description',
            targets: [transactionsTarget('transactions.common.types.Transfer.description')],
        },
        {
            publicKey: 'transactions.details.actions.backToRefund',
            targets: [transactionsTarget('transactions.details.actions.backToRefund')],
        },
        {
            publicKey: 'transactions.details.actions.copyMerchantReference',
            targets: [transactionsTarget('transactions.details.actions.copyMerchantReference')],
        },
        {
            publicKey: 'transactions.details.actions.copyPspReference',
            targets: [transactionsTarget('transactions.details.actions.copyPspReference')],
        },
        {
            publicKey: 'transactions.details.actions.copyReferenceID',
            targets: [transactionsTarget('transactions.details.actions.copyReferenceID')],
        },
        {
            publicKey: 'transactions.details.actions.goToPayment',
            targets: [transactionsTarget('transactions.details.actions.goToPayment')],
        },
        {
            publicKey: 'transactions.details.actions.refund',
            targets: [transactionsTarget('transactions.details.actions.refund')],
        },
        {
            publicKey: 'transactions.details.common.refundReasons.duplicate',
            targets: [transactionsTarget('transactions.details.common.refundReasons.duplicate')],
        },
        {
            publicKey: 'transactions.details.common.refundReasons.fraudulent',
            targets: [transactionsTarget('transactions.details.common.refundReasons.fraudulent')],
        },
        {
            publicKey: 'transactions.details.common.refundReasons.issueWithItemSold',
            targets: [transactionsTarget('transactions.details.common.refundReasons.issueWithItemSold')],
        },
        {
            publicKey: 'transactions.details.common.refundReasons.other',
            targets: [transactionsTarget('transactions.details.common.refundReasons.other')],
        },
        {
            publicKey: 'transactions.details.common.refundReasons.requestedByCustomer',
            targets: [transactionsTarget('transactions.details.common.refundReasons.requestedByCustomer')],
        },
        {
            publicKey: 'transactions.details.common.refundTypes.full',
            targets: [transactionsTarget('transactions.details.common.refundTypes.full')],
        },
        {
            publicKey: 'transactions.details.common.refundTypes.partial',
            targets: [transactionsTarget('transactions.details.common.refundTypes.partial')],
        },
        {
            publicKey: 'transactions.details.common.refundedStates.full',
            targets: [transactionsTarget('transactions.details.common.refundedStates.full')],
        },
        {
            publicKey: 'transactions.details.common.refundedStates.partial',
            targets: [transactionsTarget('transactions.details.common.refundedStates.partial')],
        },
        {
            publicKey: 'transactions.details.errors.notFound',
            targets: [transactionsTarget('transactions.details.errors.notFound')],
        },
        {
            publicKey: 'transactions.details.errors.unavailable',
            targets: [transactionsTarget('transactions.details.errors.unavailable')],
        },
        {
            publicKey: 'transactions.details.fields.account',
            targets: [transactionsTarget('transactions.details.fields.account')],
        },
        {
            publicKey: 'transactions.details.fields.fee',
            targets: [transactionsTarget('transactions.details.fields.fee')],
        },
        {
            publicKey: 'transactions.details.fields.merchantReference',
            targets: [transactionsTarget('transactions.details.fields.merchantReference')],
        },
        {
            publicKey: 'transactions.details.fields.originalAmount',
            targets: [transactionsTarget('transactions.details.fields.originalAmount')],
        },
        {
            publicKey: 'transactions.details.fields.originalPayment',
            targets: [transactionsTarget('transactions.details.fields.originalPayment')],
        },
        {
            publicKey: 'transactions.details.fields.paymentPspReference',
            targets: [transactionsTarget('transactions.details.fields.paymentPspReference')],
        },
        {
            publicKey: 'transactions.details.fields.pspReference',
            targets: [transactionsTarget('transactions.details.fields.pspReference')],
        },
        {
            publicKey: 'transactions.details.fields.referenceID',
            targets: [transactionsTarget('transactions.details.fields.referenceID')],
        },
        {
            publicKey: 'transactions.details.fields.refundFee',
            targets: [transactionsTarget('transactions.details.fields.refundFee')],
        },
        {
            publicKey: 'transactions.details.fields.refundPspReference',
            targets: [transactionsTarget('transactions.details.fields.refundPspReference')],
        },
        {
            publicKey: 'transactions.details.fields.refundReason',
            targets: [transactionsTarget('transactions.details.fields.refundReason')],
        },
        {
            publicKey: 'transactions.details.refund.actions.back',
            targets: [transactionsTarget('transactions.details.refund.actions.back')],
        },
        {
            publicKey: 'transactions.details.refund.actions.refund.labels.amount',
            targets: [transactionsTarget('transactions.details.refund.actions.refund.labels.amount')],
        },
        {
            publicKey: 'transactions.details.refund.actions.refund.labels.inProgress',
            targets: [transactionsTarget('transactions.details.refund.actions.refund.labels.inProgress')],
        },
        {
            publicKey: 'transactions.details.refund.actions.refund.labels.payment',
            targets: [transactionsTarget('transactions.details.refund.actions.refund.labels.payment')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.inProgress',
            targets: [transactionsTarget('transactions.details.refund.alerts.inProgress')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.inProgressAmount',
            targets: [transactionsTarget('transactions.details.refund.alerts.inProgressAmount')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.inProgressBlocked',
            targets: [transactionsTarget('transactions.details.refund.alerts.inProgressBlocked')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.notPossible',
            targets: [transactionsTarget('transactions.details.refund.alerts.notPossible')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.notPossibleAmount',
            targets: [transactionsTarget('transactions.details.refund.alerts.notPossibleAmount')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundFailure',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundFailure')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundSent',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundSent')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundSuccess',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundSuccess')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundableAmount',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundableAmount')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundableMaximum',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundableMaximum')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundedAmount',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundedAmount')],
        },
        {
            publicKey: 'transactions.details.refund.alerts.refundedFull',
            targets: [transactionsTarget('transactions.details.refund.alerts.refundedFull')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.amount.errors.excess',
            targets: [transactionsTarget('transactions.details.refund.inputs.amount.errors.excess')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.amount.errors.negative',
            targets: [transactionsTarget('transactions.details.refund.inputs.amount.errors.negative')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.amount.errors.required',
            targets: [transactionsTarget('transactions.details.refund.inputs.amount.errors.required')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.amount.label',
            targets: [transactionsTarget('transactions.details.refund.inputs.amount.label')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.reason.label',
            targets: [transactionsTarget('transactions.details.refund.inputs.reason.label')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.reference.label',
            targets: [transactionsTarget('transactions.details.refund.inputs.reference.label')],
        },
        {
            publicKey: 'transactions.details.refund.inputs.reference.placeholder',
            targets: [transactionsTarget('transactions.details.refund.inputs.reference.placeholder')],
        },
        {
            publicKey: 'transactions.details.refund.processingInfo',
            targets: [transactionsTarget('transactions.details.refund.processingInfo')],
        },
        {
            publicKey: 'transactions.details.refund.title',
            targets: [transactionsTarget('transactions.details.refund.title')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.fee',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.fee')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.other',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.other')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.split',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.split')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.surcharge',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.surcharge')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.surcharge.information',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.surcharge.information')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.tip',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.tip')],
        },
        {
            publicKey: 'transactions.details.summary.adjustments.types.tip.information',
            targets: [transactionsTarget('transactions.details.summary.adjustments.types.tip.information')],
        },
        {
            publicKey: 'transactions.details.summary.fields.grossAmount',
            targets: [transactionsTarget('transactions.details.summary.fields.grossAmount')],
        },
        {
            publicKey: 'transactions.details.summary.fields.netAmount',
            targets: [transactionsTarget('transactions.details.summary.fields.netAmount')],
        },
        {
            publicKey: 'transactions.details.summary.fields.originalAmount',
            targets: [transactionsTarget('transactions.details.summary.fields.originalAmount')],
        },
        {
            publicKey: 'transactions.details.timeline.fields.amount',
            targets: [transactionsTarget('transactions.details.timeline.fields.amount')],
        },
        {
            publicKey: 'transactions.details.timeline.fields.status',
            targets: [transactionsTarget('transactions.details.timeline.fields.status')],
        },
        {
            publicKey: 'transactions.details.title',
            targets: [transactionsTarget('transactions.details.title')],
        },
        {
            publicKey: 'transactions.details.viewSelect.a11y.label',
            targets: [transactionsTarget('transactions.details.viewSelect.a11y.label')],
        },
        {
            publicKey: 'transactions.details.views.details',
            targets: [transactionsTarget('transactions.details.views.details')],
        },
        {
            publicKey: 'transactions.details.views.summary',
            targets: [transactionsTarget('transactions.details.views.summary')],
        },
        {
            publicKey: 'transactions.details.views.timeline',
            targets: [transactionsTarget('transactions.details.views.timeline')],
        },
        {
            publicKey: 'transactions.overview.balances.currency.label',
            targets: [transactionsTarget('transactions.overview.balances.currency.label')],
        },
        {
            publicKey: 'transactions.overview.balances.error',
            targets: [transactionsTarget('transactions.overview.balances.error')],
        },
        {
            publicKey: 'transactions.overview.balances.labels.available',
            targets: [transactionsTarget('transactions.overview.balances.labels.available')],
        },
        {
            publicKey: 'transactions.overview.balances.labels.default',
            targets: [transactionsTarget('transactions.overview.balances.labels.default')],
        },
        {
            publicKey: 'transactions.overview.balances.labels.reserved',
            targets: [transactionsTarget('transactions.overview.balances.labels.reserved')],
        },
        {
            publicKey: 'transactions.overview.balances.lists.available',
            targets: [transactionsTarget('transactions.overview.balances.lists.available')],
        },
        {
            publicKey: 'transactions.overview.balances.lists.default',
            targets: [transactionsTarget('transactions.overview.balances.lists.default')],
        },
        {
            publicKey: 'transactions.overview.balances.lists.reserved',
            targets: [transactionsTarget('transactions.overview.balances.lists.reserved')],
        },
        {
            publicKey: 'transactions.overview.balances.tags.available',
            targets: [transactionsTarget('transactions.overview.balances.tags.available')],
        },
        {
            publicKey: 'transactions.overview.balances.tags.balance',
            targets: [transactionsTarget('transactions.overview.balances.tags.balance')],
        },
        {
            publicKey: 'transactions.overview.balances.tags.reserved',
            targets: [transactionsTarget('transactions.overview.balances.tags.reserved')],
        },
        {
            publicKey: 'transactions.overview.balances.tags.reserved.description',
            targets: [transactionsTarget('transactions.overview.balances.tags.reserved.description')],
        },
        {
            publicKey: 'transactions.overview.errors.listEmpty',
            targets: [transactionsTarget('transactions.overview.errors.listEmpty')],
        },
        {
            publicKey: 'transactions.overview.errors.listUnavailable',
            targets: [transactionsTarget('transactions.overview.errors.listUnavailable')],
        },
        {
            publicKey: 'transactions.overview.errors.unavailable',
            targets: [transactionsTarget('transactions.overview.errors.unavailable')],
        },
        {
            publicKey: 'transactions.overview.export.actions.cancel',
            targets: [transactionsTarget('transactions.overview.export.actions.cancel')],
        },
        {
            publicKey: 'transactions.overview.export.actions.download',
            targets: [transactionsTarget('transactions.overview.export.actions.download')],
        },
        {
            publicKey: 'transactions.overview.export.actions.download.info',
            targets: [transactionsTarget('transactions.overview.export.actions.download.info')],
        },
        {
            publicKey: 'transactions.overview.export.actions.error',
            targets: [transactionsTarget('transactions.overview.export.actions.error')],
        },
        {
            publicKey: 'transactions.overview.export.button.inProgress',
            targets: [transactionsTarget('transactions.overview.export.button.inProgress')],
        },
        {
            publicKey: 'transactions.overview.export.button.label',
            targets: [transactionsTarget('transactions.overview.export.button.label')],
        },
        {
            publicKey: 'transactions.overview.export.columns.title',
            targets: [transactionsTarget('transactions.overview.export.columns.title')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.all',
            targets: [transactionsTarget('transactions.overview.export.columns.types.all')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.amountBeforeDeductions',
            targets: [transactionsTarget('transactions.overview.export.columns.types.amountBeforeDeductions')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.balanceAccountId',
            targets: [transactionsTarget('transactions.overview.export.columns.types.balanceAccountId')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.category',
            targets: [transactionsTarget('transactions.overview.export.columns.types.category')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.createdAt',
            targets: [transactionsTarget('transactions.overview.export.columns.types.createdAt')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.currency',
            targets: [transactionsTarget('transactions.overview.export.columns.types.currency')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.id',
            targets: [transactionsTarget('transactions.overview.export.columns.types.id')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.netAmount',
            targets: [transactionsTarget('transactions.overview.export.columns.types.netAmount')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.paymentMethod',
            targets: [transactionsTarget('transactions.overview.export.columns.types.paymentMethod')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.paymentPspReference',
            targets: [transactionsTarget('transactions.overview.export.columns.types.paymentPspReference')],
        },
        {
            publicKey: 'transactions.overview.export.columns.types.status',
            targets: [transactionsTarget('transactions.overview.export.columns.types.status')],
        },
        {
            publicKey: 'transactions.overview.export.filters.title',
            targets: [transactionsTarget('transactions.overview.export.filters.title')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.account',
            targets: [transactionsTarget('transactions.overview.export.filters.types.account')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.category',
            targets: [transactionsTarget('transactions.overview.export.filters.types.category')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.currency',
            targets: [transactionsTarget('transactions.overview.export.filters.types.currency')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.date',
            targets: [transactionsTarget('transactions.overview.export.filters.types.date')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.paymentPspReference',
            targets: [transactionsTarget('transactions.overview.export.filters.types.paymentPspReference')],
        },
        {
            publicKey: 'transactions.overview.export.filters.types.status',
            targets: [transactionsTarget('transactions.overview.export.filters.types.status')],
        },
        {
            publicKey: 'transactions.overview.filters.label',
            targets: [transactionsTarget('transactions.overview.filters.label')],
        },
        {
            publicKey: 'transactions.overview.filters.types.amount.label',
            targets: [transactionsTarget('transactions.overview.filters.types.amount.label')],
        },
        {
            publicKey: 'transactions.overview.filters.types.category.label',
            targets: [transactionsTarget('transactions.overview.filters.types.category.label')],
        },
        {
            publicKey: 'transactions.overview.filters.types.currency.label',
            targets: [transactionsTarget('transactions.overview.filters.types.currency.label')],
        },
        {
            publicKey: 'transactions.overview.filters.types.paymentPspReference.errors.invalidLength',
            targets: [transactionsTarget('transactions.overview.filters.types.paymentPspReference.errors.invalidLength')],
        },
        {
            publicKey: 'transactions.overview.filters.types.paymentPspReference.fromDateInfo',
            targets: [transactionsTarget('transactions.overview.filters.types.paymentPspReference.fromDateInfo')],
        },
        {
            publicKey: 'transactions.overview.filters.types.paymentPspReference.label',
            targets: [transactionsTarget('transactions.overview.filters.types.paymentPspReference.label')],
        },
        {
            publicKey: 'transactions.overview.filters.types.paymentPspReference.placeholder',
            targets: [transactionsTarget('transactions.overview.filters.types.paymentPspReference.placeholder')],
        },
        {
            publicKey: 'transactions.overview.filters.types.status.label',
            targets: [transactionsTarget('transactions.overview.filters.types.status.label')],
        },
        {
            publicKey: 'transactions.overview.list.fields.amount',
            targets: [transactionsTarget('transactions.overview.list.fields.amount')],
        },
        {
            publicKey: 'transactions.overview.list.fields.createdAt',
            targets: [transactionsTarget('transactions.overview.list.fields.createdAt')],
        },
        {
            publicKey: 'transactions.overview.list.fields.currency',
            targets: [transactionsTarget('transactions.overview.list.fields.currency')],
        },
        {
            publicKey: 'transactions.overview.list.fields.grossAmount',
            targets: [transactionsTarget('transactions.overview.list.fields.grossAmount')],
        },
        {
            publicKey: 'transactions.overview.list.fields.netAmount',
            targets: [transactionsTarget('transactions.overview.list.fields.netAmount')],
        },
        {
            publicKey: 'transactions.overview.list.fields.paymentMethod',
            targets: [transactionsTarget('transactions.overview.list.fields.paymentMethod')],
        },
        {
            publicKey: 'transactions.overview.list.fields.status',
            targets: [transactionsTarget('transactions.overview.list.fields.status')],
        },
        {
            publicKey: 'transactions.overview.list.fields.transactionType',
            targets: [transactionsTarget('transactions.overview.list.fields.transactionType')],
        },
        {
            publicKey: 'transactions.overview.pagination.controls.limitSelect.label',
            targets: [transactionsTarget('transactions.overview.pagination.controls.limitSelect.label')],
        },
        {
            publicKey: 'transactions.overview.pagination.label',
            targets: [transactionsTarget('transactions.overview.pagination.label')],
        },
        {
            publicKey: 'transactions.overview.title',
            targets: [transactionsTarget('transactions.overview.title')],
        },
        {
            publicKey: 'transactions.overview.totals.currency.label',
            targets: [transactionsTarget('transactions.overview.totals.currency.label')],
        },
        {
            publicKey: 'transactions.overview.totals.error',
            targets: [transactionsTarget('transactions.overview.totals.error')],
        },
        {
            publicKey: 'transactions.overview.totals.labels.default',
            targets: [transactionsTarget('transactions.overview.totals.labels.default')],
        },
        {
            publicKey: 'transactions.overview.totals.labels.incoming',
            targets: [transactionsTarget('transactions.overview.totals.labels.incoming')],
        },
        {
            publicKey: 'transactions.overview.totals.labels.outgoing',
            targets: [transactionsTarget('transactions.overview.totals.labels.outgoing')],
        },
        {
            publicKey: 'transactions.overview.totals.lists.default',
            targets: [transactionsTarget('transactions.overview.totals.lists.default')],
        },
        {
            publicKey: 'transactions.overview.totals.lists.incoming',
            targets: [transactionsTarget('transactions.overview.totals.lists.incoming')],
        },
        {
            publicKey: 'transactions.overview.totals.lists.outgoing',
            targets: [transactionsTarget('transactions.overview.totals.lists.outgoing')],
        },
        {
            publicKey: 'transactions.overview.totals.tags.incoming',
            targets: [transactionsTarget('transactions.overview.totals.tags.incoming')],
        },
        {
            publicKey: 'transactions.overview.totals.tags.incoming.description',
            targets: [transactionsTarget('transactions.overview.totals.tags.incoming.description')],
        },
        {
            publicKey: 'transactions.overview.totals.tags.outgoing',
            targets: [transactionsTarget('transactions.overview.totals.tags.outgoing')],
        },
        {
            publicKey: 'transactions.overview.totals.tags.outgoing.description',
            targets: [transactionsTarget('transactions.overview.totals.tags.outgoing.description')],
        },
        {
            publicKey: 'transactions.overview.totals.tags.periodResult',
            targets: [transactionsTarget('transactions.overview.totals.tags.periodResult')],
        },
        {
            publicKey: 'transactions.overview.viewSelect.a11y.label',
            targets: [transactionsTarget('transactions.overview.viewSelect.a11y.label')],
        },
        {
            publicKey: 'transactions.overview.views.insights',
            targets: [transactionsTarget('transactions.overview.views.insights')],
        },
        {
            publicKey: 'transactions.overview.views.transactions',
            targets: [transactionsTarget('transactions.overview.views.transactions')],
        },
        {
            publicKey: 'payByLink.common.actions.goBack',
            targets: [payByLinkTarget('payByLink.common.actions.goBack')],
        },
        {
            publicKey: 'payByLink.common.errors.accountConfiguration',
            targets: [payByLinkTarget('payByLink.common.errors.accountConfiguration')],
        },
        {
            publicKey: 'payByLink.common.errors.storeID',
            targets: [payByLinkTarget('payByLink.common.errors.storeID')],
        },
        {
            publicKey: 'payByLink.common.fields.optional.label',
            targets: [payByLinkTarget('payByLink.common.fields.optional.label')],
        },
        {
            publicKey: 'payByLink.common.linkType.open',
            targets: [payByLinkTarget('payByLink.common.linkType.open')],
        },
        {
            publicKey: 'payByLink.common.linkType.singleUse',
            targets: [payByLinkTarget('payByLink.common.linkType.singleUse')],
        },
        {
            publicKey: 'payByLink.common.status.active',
            targets: [payByLinkTarget('payByLink.common.status.active')],
        },
        {
            publicKey: 'payByLink.common.status.completed',
            targets: [payByLinkTarget('payByLink.common.status.completed')],
        },
        {
            publicKey: 'payByLink.common.status.expired',
            targets: [payByLinkTarget('payByLink.common.status.expired')],
        },
        {
            publicKey: 'payByLink.common.status.paymentPending',
            targets: [payByLinkTarget('payByLink.common.status.paymentPending')],
        },
        {
            publicKey: 'payByLink.creation.errors.invalidFields.reason.amountTooHigh',
            targets: [payByLinkTarget('payByLink.creation.errors.invalidFields.reason.amountTooHigh')],
        },
        {
            publicKey: 'payByLink.creation.errors.unavailable',
            targets: [payByLinkTarget('payByLink.creation.errors.unavailable')],
        },
        {
            publicKey: 'payByLink.creation.fields.amount.currency.ariaLabel',
            targets: [payByLinkTarget('payByLink.creation.fields.amount.currency.ariaLabel')],
        },
        {
            publicKey: 'payByLink.creation.fields.amount.label',
            targets: [payByLinkTarget('payByLink.creation.fields.amount.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.amountValue.error.currency',
            targets: [payByLinkTarget('payByLink.creation.fields.amountValue.error.currency')],
        },
        {
            publicKey: 'payByLink.creation.fields.amountValue.error.negativeNumber',
            targets: [payByLinkTarget('payByLink.creation.fields.amountValue.error.negativeNumber')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.city.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.city.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.country.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.country.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.houseNumberOrName.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.houseNumberOrName.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.postalCode.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.postalCode.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAddress.street.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAddress.street.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.billingAndDeliverySeparateAddress.label',
            targets: [payByLinkTarget('payByLink.creation.fields.billingAndDeliverySeparateAddress.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.country.label',
            targets: [payByLinkTarget('payByLink.creation.fields.country.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliverAt.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliverAt.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliveryAddress.city.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliveryAddress.city.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliveryAddress.country.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliveryAddress.country.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliveryAddress.houseNumberOrName.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliveryAddress.houseNumberOrName.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliveryAddress.postalCode.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliveryAddress.postalCode.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.deliveryAddress.street.label',
            targets: [payByLinkTarget('payByLink.creation.fields.deliveryAddress.street.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.description.label',
            targets: [payByLinkTarget('payByLink.creation.fields.description.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.description.supportText',
            targets: [payByLinkTarget('payByLink.creation.fields.description.supportText')],
        },
        {
            publicKey: 'payByLink.creation.fields.language.label',
            targets: [payByLinkTarget('payByLink.creation.fields.language.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.linkType.label',
            targets: [payByLinkTarget('payByLink.creation.fields.linkType.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.merchantReference.label',
            targets: [payByLinkTarget('payByLink.creation.fields.merchantReference.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.phoneNumber.errors.requiredPhoneCode',
            targets: [payByLinkTarget('payByLink.creation.fields.phoneNumber.errors.requiredPhoneCode')],
        },
        {
            publicKey: 'payByLink.creation.fields.phoneNumber.errors.requiredPhoneNumber',
            targets: [payByLinkTarget('payByLink.creation.fields.phoneNumber.errors.requiredPhoneNumber')],
        },
        {
            publicKey: 'payByLink.creation.fields.sendLinkToShopper.label',
            targets: [payByLinkTarget('payByLink.creation.fields.sendLinkToShopper.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.sendPaymentSuccessToShopper.label',
            targets: [payByLinkTarget('payByLink.creation.fields.sendPaymentSuccessToShopper.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shippingAndBillingSameAddress.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shippingAndBillingSameAddress.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperEmail.error.validEmail',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperEmail.error.validEmail')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperEmail.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperEmail.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperLastName.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperLastName.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperName.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperName.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperPhone.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperPhone.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperPhone.phonePrefix.placeholder',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperPhone.phonePrefix.placeholder')],
        },
        {
            publicKey: 'payByLink.creation.fields.shopperReference.label',
            targets: [payByLinkTarget('payByLink.creation.fields.shopperReference.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.store.label',
            targets: [payByLinkTarget('payByLink.creation.fields.store.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.customDuration.error.durationTooLong',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.customDuration.error.durationTooLong')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.customDuration.error.invalidDurationValue',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.customDuration.error.invalidDurationValue')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.customDuration.error.missingDurationUnit',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.customDuration.error.missingDurationUnit')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.customDuration.error.missingDurationValue',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.customDuration.error.missingDurationValue')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.customDuration.label',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.customDuration.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.label',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.label')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.custom',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.custom')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.day',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.day')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.day__plural',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.day__plural')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.hour',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.hour')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.hour__plural',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.hour__plural')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.minute',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.minute')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.minute__plural',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.minute__plural')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.week',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.week')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.linkValidityUnit.week__plural',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.linkValidityUnit.week__plural')],
        },
        {
            publicKey: 'payByLink.creation.fields.validity.supportText',
            targets: [payByLinkTarget('payByLink.creation.fields.validity.supportText')],
        },
        {
            publicKey: 'payByLink.creation.form.alert.invalidFields',
            targets: [payByLinkTarget('payByLink.creation.form.alert.invalidFields')],
        },
        {
            publicKey: 'payByLink.creation.form.alert.somethingWentWrong',
            targets: [payByLinkTarget('payByLink.creation.form.alert.somethingWentWrong')],
        },
        {
            publicKey: 'payByLink.creation.form.error.submit.contactSupport',
            targets: [payByLinkTarget('payByLink.creation.form.error.submit.contactSupport')],
        },
        {
            publicKey: 'payByLink.creation.form.linkTypes.open',
            targets: [payByLinkTarget('payByLink.creation.form.linkTypes.open')],
        },
        {
            publicKey: 'payByLink.creation.form.linkTypes.singleUse',
            targets: [payByLinkTarget('payByLink.creation.form.linkTypes.singleUse')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.back',
            targets: [payByLinkTarget('payByLink.creation.form.steps.back')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.continue',
            targets: [payByLinkTarget('payByLink.creation.form.steps.continue')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.customer',
            targets: [payByLinkTarget('payByLink.creation.form.steps.customer')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.payment',
            targets: [payByLinkTarget('payByLink.creation.form.steps.payment')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.store',
            targets: [payByLinkTarget('payByLink.creation.form.steps.store')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.submit',
            targets: [payByLinkTarget('payByLink.creation.form.steps.submit')],
        },
        {
            publicKey: 'payByLink.creation.form.steps.summary',
            targets: [payByLinkTarget('payByLink.creation.form.steps.summary')],
        },
        {
            publicKey: 'payByLink.creation.form.title',
            targets: [payByLinkTarget('payByLink.creation.form.title')],
        },
        {
            publicKey: 'payByLink.creation.sections.billingAddress.label',
            targets: [payByLinkTarget('payByLink.creation.sections.billingAddress.label')],
        },
        {
            publicKey: 'payByLink.creation.sections.deliveryAddress.label',
            targets: [payByLinkTarget('payByLink.creation.sections.deliveryAddress.label')],
        },
        {
            publicKey: 'payByLink.creation.steps.a11y.label',
            targets: [payByLinkTarget('payByLink.creation.steps.a11y.label')],
        },
        {
            publicKey: 'payByLink.creation.storeForm.alerts.tcSetupRequired',
            targets: [payByLinkTarget('payByLink.creation.storeForm.alerts.tcSetupRequired')],
        },
        {
            publicKey: 'payByLink.creation.storeForm.alerts.tcSetupRequiredAction',
            targets: [payByLinkTarget('payByLink.creation.storeForm.alerts.tcSetupRequiredAction')],
        },
        {
            publicKey: 'payByLink.creation.storeForm.alerts.tcSetupRequiredTitle',
            targets: [payByLinkTarget('payByLink.creation.storeForm.alerts.tcSetupRequiredTitle')],
        },
        {
            publicKey: 'payByLink.creation.storeForm.alerts.tcSetupRequiredWithoutPermissions',
            targets: [payByLinkTarget('payByLink.creation.storeForm.alerts.tcSetupRequiredWithoutPermissions')],
        },
        {
            publicKey: 'payByLink.creation.success.copiedToClipboard',
            targets: [payByLinkTarget('payByLink.creation.success.copiedToClipboard')],
        },
        {
            publicKey: 'payByLink.creation.success.copyLink',
            targets: [payByLinkTarget('payByLink.creation.success.copyLink')],
        },
        {
            publicKey: 'payByLink.creation.success.description',
            targets: [payByLinkTarget('payByLink.creation.success.description')],
        },
        {
            publicKey: 'payByLink.creation.success.showDetails',
            targets: [payByLinkTarget('payByLink.creation.success.showDetails')],
        },
        {
            publicKey: 'payByLink.creation.success.title',
            targets: [payByLinkTarget('payByLink.creation.success.title')],
        },
        {
            publicKey: 'payByLink.creation.summary.alertDescription',
            targets: [payByLinkTarget('payByLink.creation.summary.alertDescription')],
        },
        {
            publicKey: 'payByLink.creation.summary.back',
            targets: [payByLinkTarget('payByLink.creation.summary.back')],
        },
        {
            publicKey: 'payByLink.creation.summary.billingAddress',
            targets: [payByLinkTarget('payByLink.creation.summary.billingAddress')],
        },
        {
            publicKey: 'payByLink.creation.summary.deliveryAddress',
            targets: [payByLinkTarget('payByLink.creation.summary.deliveryAddress')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.amountValue',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.amountValue')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.city',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.city')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.country',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.country')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.houseNumberOrName',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.houseNumberOrName')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.postalCode',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.postalCode')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.stateOrProvince',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.stateOrProvince')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.billingAddress.street',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.billingAddress.street')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.countryCode',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.countryCode')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.currency',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.currency')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.city',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.city')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.country',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.country')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.houseNumberOrName',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.houseNumberOrName')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.postalCode',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.postalCode')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.stateOrProvince',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.stateOrProvince')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.deliveryAddress.street',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.deliveryAddress.street')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.description',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.description')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.emailAddress',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.emailAddress')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.emailNotifications',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.emailNotifications')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.emailNotifications.emailCreation',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.emailNotifications.emailCreation')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.emailNotifications.paymentSuccess',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.emailNotifications.paymentSuccess')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.linkType',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.linkType')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.linkValidity',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.linkValidity')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.merchantReference',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.merchantReference')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.phoneNumber',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.phoneNumber')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.shopperLastName',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.shopperLastName')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.shopperName',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.shopperName')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.shopperReference',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.shopperReference')],
        },
        {
            publicKey: 'payByLink.creation.summary.fields.store',
            targets: [payByLinkTarget('payByLink.creation.summary.fields.store')],
        },
        {
            publicKey: 'payByLink.creation.summary.paymentDetails',
            targets: [payByLinkTarget('payByLink.creation.summary.paymentDetails')],
        },
        {
            publicKey: 'payByLink.creation.summary.shopperInformation',
            targets: [payByLinkTarget('payByLink.creation.summary.shopperInformation')],
        },
        {
            publicKey: 'payByLink.details.actions.copied',
            targets: [payByLinkTarget('payByLink.details.actions.copied')],
        },
        {
            publicKey: 'payByLink.details.actions.copyLink',
            targets: [payByLinkTarget('payByLink.details.actions.copyLink')],
        },
        {
            publicKey: 'payByLink.details.actions.expire',
            targets: [payByLinkTarget('payByLink.details.actions.expire')],
        },
        {
            publicKey: 'payByLink.details.actions.goBack',
            targets: [payByLinkTarget('payByLink.details.actions.goBack')],
        },
        {
            publicKey: 'payByLink.details.activity.created',
            targets: [payByLinkTarget('payByLink.details.activity.created')],
        },
        {
            publicKey: 'payByLink.details.activity.expirationReason.expirationDateReached',
            targets: [payByLinkTarget('payByLink.details.activity.expirationReason.expirationDateReached')],
        },
        {
            publicKey: 'payByLink.details.activity.expirationReason.manuallyExpired',
            targets: [payByLinkTarget('payByLink.details.activity.expirationReason.manuallyExpired')],
        },
        {
            publicKey: 'payByLink.details.activity.expirationReason.maximumAttemptsReached',
            targets: [payByLinkTarget('payByLink.details.activity.expirationReason.maximumAttemptsReached')],
        },
        {
            publicKey: 'payByLink.details.activity.expired',
            targets: [payByLinkTarget('payByLink.details.activity.expired')],
        },
        {
            publicKey: 'payByLink.details.activity.paymentAttempt',
            targets: [payByLinkTarget('payByLink.details.activity.paymentAttempt')],
        },
        {
            publicKey: 'payByLink.details.errors.unavailable',
            targets: [payByLinkTarget('payByLink.details.errors.unavailable')],
        },
        {
            publicKey: 'payByLink.details.expiration.actions.confirmExpiration',
            targets: [payByLinkTarget('payByLink.details.expiration.actions.confirmExpiration')],
        },
        {
            publicKey: 'payByLink.details.expiration.actions.goBack',
            targets: [payByLinkTarget('payByLink.details.expiration.actions.goBack')],
        },
        {
            publicKey: 'payByLink.details.expiration.description',
            targets: [payByLinkTarget('payByLink.details.expiration.description')],
        },
        {
            publicKey: 'payByLink.details.expiration.errorDescription',
            targets: [payByLinkTarget('payByLink.details.expiration.errorDescription')],
        },
        {
            publicKey: 'payByLink.details.expiration.errorTitle',
            targets: [payByLinkTarget('payByLink.details.expiration.errorTitle')],
        },
        {
            publicKey: 'payByLink.details.expiration.title',
            targets: [payByLinkTarget('payByLink.details.expiration.title')],
        },
        {
            publicKey: 'payByLink.details.expirationSuccess.actions.goBackToList',
            targets: [payByLinkTarget('payByLink.details.expirationSuccess.actions.goBackToList')],
        },
        {
            publicKey: 'payByLink.details.expirationSuccess.actions.showDetails',
            targets: [payByLinkTarget('payByLink.details.expirationSuccess.actions.showDetails')],
        },
        {
            publicKey: 'payByLink.details.expirationSuccess.description',
            targets: [payByLinkTarget('payByLink.details.expirationSuccess.description')],
        },
        {
            publicKey: 'payByLink.details.expirationSuccess.title',
            targets: [payByLinkTarget('payByLink.details.expirationSuccess.title')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.city',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.city')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.country',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.country')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.houseNumberOrName',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.houseNumberOrName')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.postalCode',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.postalCode')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.street',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.street')],
        },
        {
            publicKey: 'payByLink.details.fields.billingAddress.title',
            targets: [payByLinkTarget('payByLink.details.fields.billingAddress.title')],
        },
        {
            publicKey: 'payByLink.details.fields.createdOn',
            targets: [payByLinkTarget('payByLink.details.fields.createdOn')],
        },
        {
            publicKey: 'payByLink.details.fields.description',
            targets: [payByLinkTarget('payByLink.details.fields.description')],
        },
        {
            publicKey: 'payByLink.details.fields.expiresOn',
            targets: [payByLinkTarget('payByLink.details.fields.expiresOn')],
        },
        {
            publicKey: 'payByLink.details.fields.linkType',
            targets: [payByLinkTarget('payByLink.details.fields.linkType')],
        },
        {
            publicKey: 'payByLink.details.fields.merchantReference',
            targets: [payByLinkTarget('payByLink.details.fields.merchantReference')],
        },
        {
            publicKey: 'payByLink.details.fields.paymentLinkId',
            targets: [payByLinkTarget('payByLink.details.fields.paymentLinkId')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.city',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.city')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.country',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.country')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.houseNumberOrName',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.houseNumberOrName')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.postalCode',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.postalCode')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.street',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.street')],
        },
        {
            publicKey: 'payByLink.details.fields.shippingAddress.title',
            targets: [payByLinkTarget('payByLink.details.fields.shippingAddress.title')],
        },
        {
            publicKey: 'payByLink.details.fields.shopper.country',
            targets: [payByLinkTarget('payByLink.details.fields.shopper.country')],
        },
        {
            publicKey: 'payByLink.details.fields.shopper.email',
            targets: [payByLinkTarget('payByLink.details.fields.shopper.email')],
        },
        {
            publicKey: 'payByLink.details.fields.shopper.fullName',
            targets: [payByLinkTarget('payByLink.details.fields.shopper.fullName')],
        },
        {
            publicKey: 'payByLink.details.fields.shopper.phone',
            targets: [payByLinkTarget('payByLink.details.fields.shopper.phone')],
        },
        {
            publicKey: 'payByLink.details.fields.shopper.reference',
            targets: [payByLinkTarget('payByLink.details.fields.shopper.reference')],
        },
        {
            publicKey: 'payByLink.details.fields.store',
            targets: [payByLinkTarget('payByLink.details.fields.store')],
        },
        {
            publicKey: 'payByLink.details.tabs.activity',
            targets: [payByLinkTarget('payByLink.details.tabs.activity')],
        },
        {
            publicKey: 'payByLink.details.tabs.linkInformation',
            targets: [payByLinkTarget('payByLink.details.tabs.linkInformation')],
        },
        {
            publicKey: 'payByLink.details.tabs.shopperInformation',
            targets: [payByLinkTarget('payByLink.details.tabs.shopperInformation')],
        },
        {
            publicKey: 'payByLink.details.title',
            targets: [payByLinkTarget('payByLink.details.title')],
        },
        {
            publicKey: 'payByLink.overview.actions.settings.a11y.label',
            targets: [payByLinkTarget('payByLink.overview.actions.settings.a11y.label')],
        },
        {
            publicKey: 'payByLink.overview.common.actionNeeded.expiresAt',
            targets: [payByLinkTarget('payByLink.overview.common.actionNeeded.expiresAt')],
        },
        {
            publicKey: 'payByLink.overview.common.actionNeeded.expiresDays',
            targets: [payByLinkTarget('payByLink.overview.common.actionNeeded.expiresDays')],
        },
        {
            publicKey: 'payByLink.overview.common.actionNeeded.expiresToday',
            targets: [payByLinkTarget('payByLink.overview.common.actionNeeded.expiresToday')],
        },
        {
            publicKey: 'payByLink.overview.errors.couldNotLoadLinks',
            targets: [payByLinkTarget('payByLink.overview.errors.couldNotLoadLinks')],
        },
        {
            publicKey: 'payByLink.overview.errors.listEmpty',
            targets: [payByLinkTarget('payByLink.overview.errors.listEmpty')],
        },
        {
            publicKey: 'payByLink.overview.errors.listEmpty.message',
            targets: [payByLinkTarget('payByLink.overview.errors.listEmpty.message')],
        },
        {
            publicKey: 'payByLink.overview.errors.listUnavailable',
            targets: [payByLinkTarget('payByLink.overview.errors.listUnavailable')],
        },
        {
            publicKey: 'payByLink.overview.errors.unavailable',
            targets: [payByLinkTarget('payByLink.overview.errors.unavailable')],
        },
        {
            publicKey: 'payByLink.overview.filters.errors.networkError',
            targets: [payByLinkTarget('payByLink.overview.filters.errors.networkError')],
        },
        {
            publicKey: 'payByLink.overview.filters.label',
            targets: [payByLinkTarget('payByLink.overview.filters.label')],
        },
        {
            publicKey: 'payByLink.overview.filters.types.linkTypes.label',
            targets: [payByLinkTarget('payByLink.overview.filters.types.linkTypes.label')],
        },
        {
            publicKey: 'payByLink.overview.filters.types.merchantReference.label',
            targets: [payByLinkTarget('payByLink.overview.filters.types.merchantReference.label')],
        },
        {
            publicKey: 'payByLink.overview.filters.types.paymentLinkID.label',
            targets: [payByLinkTarget('payByLink.overview.filters.types.paymentLinkID.label')],
        },
        {
            publicKey: 'payByLink.overview.filters.types.status.label',
            targets: [payByLinkTarget('payByLink.overview.filters.types.status.label')],
        },
        {
            publicKey: 'payByLink.overview.filters.types.stores.label',
            targets: [payByLinkTarget('payByLink.overview.filters.types.stores.label')],
        },
        {
            publicKey: 'payByLink.overview.list.actions.createPaymentLink',
            targets: [payByLinkTarget('payByLink.overview.list.actions.createPaymentLink')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.amount',
            targets: [payByLinkTarget('payByLink.overview.list.fields.amount')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.createdAt',
            targets: [payByLinkTarget('payByLink.overview.list.fields.createdAt')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.currency',
            targets: [payByLinkTarget('payByLink.overview.list.fields.currency')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.expirationDate',
            targets: [payByLinkTarget('payByLink.overview.list.fields.expirationDate')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.id',
            targets: [payByLinkTarget('payByLink.overview.list.fields.id')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.linkType',
            targets: [payByLinkTarget('payByLink.overview.list.fields.linkType')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.merchantReference',
            targets: [payByLinkTarget('payByLink.overview.list.fields.merchantReference')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.shopperEmail',
            targets: [payByLinkTarget('payByLink.overview.list.fields.shopperEmail')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.status',
            targets: [payByLinkTarget('payByLink.overview.list.fields.status')],
        },
        {
            publicKey: 'payByLink.overview.list.fields.store',
            targets: [payByLinkTarget('payByLink.overview.list.fields.store')],
        },
        {
            publicKey: 'payByLink.overview.list.filters.types.statusGroup',
            targets: [payByLinkTarget('payByLink.overview.list.filters.types.statusGroup')],
        },
        {
            publicKey: 'payByLink.overview.list.statusGroups.active',
            targets: [payByLinkTarget('payByLink.overview.list.statusGroups.active')],
        },
        {
            publicKey: 'payByLink.overview.list.statusGroups.inactive',
            targets: [payByLinkTarget('payByLink.overview.list.statusGroups.inactive')],
        },
        {
            publicKey: 'payByLink.overview.pagination.controls.limitSelect.label',
            targets: [payByLinkTarget('payByLink.overview.pagination.controls.limitSelect.label')],
        },
        {
            publicKey: 'payByLink.overview.pagination.label',
            targets: [payByLinkTarget('payByLink.overview.pagination.label')],
        },
        {
            publicKey: 'payByLink.overview.title',
            targets: [payByLinkTarget('payByLink.overview.title')],
        },
        {
            publicKey: 'payByLink.settings.common.action.save',
            targets: [payByLinkTarget('payByLink.settings.common.action.save')],
        },
        {
            publicKey: 'payByLink.settings.common.alerts.saveError',
            targets: [payByLinkTarget('payByLink.settings.common.alerts.saveError')],
        },
        {
            publicKey: 'payByLink.settings.common.alerts.saveSuccess',
            targets: [payByLinkTarget('payByLink.settings.common.alerts.saveSuccess')],
        },
        {
            publicKey: 'payByLink.settings.common.alerts.validationError',
            targets: [payByLinkTarget('payByLink.settings.common.alerts.validationError')],
        },
        {
            publicKey: 'payByLink.settings.errors.couldNotLoadSettings',
            targets: [payByLinkTarget('payByLink.settings.errors.couldNotLoadSettings')],
        },
        {
            publicKey: 'payByLink.settings.navigation.termsAndConditions',
            targets: [payByLinkTarget('payByLink.settings.navigation.termsAndConditions')],
        },
        {
            publicKey: 'payByLink.settings.navigation.theme',
            targets: [payByLinkTarget('payByLink.settings.navigation.theme')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.actions.confirmRequirements',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.actions.confirmRequirements')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.actions.goBack',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.actions.goBack')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.contactInformation.description',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.contactInformation.description')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.contactInformation.emailAddress',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.contactInformation.emailAddress')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.contactInformation.legalEntityName',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.contactInformation.legalEntityName')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.contactInformation.phoneNumber',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.contactInformation.phoneNumber')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.contactInformation.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.contactInformation.title')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.deliveryInformation.deliveryRegions',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.deliveryInformation.deliveryRegions')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.deliveryInformation.deliveryTime',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.deliveryInformation.deliveryTime')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.deliveryInformation.description',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.deliveryInformation.description')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.deliveryInformation.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.deliveryInformation.title')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.description',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.description')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.governingLaw',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.governingLaw')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.legalEntity',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.legalEntity')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.paymentExplanation',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.paymentExplanation')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.productDescription',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.productDescription')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.thirdParties',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.thirdParties')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.generalTerms.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.generalTerms.title')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.privacyPolicy.cookiePolicy',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.privacyPolicy.cookiePolicy')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.privacyPolicy.dataSharing',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.privacyPolicy.dataSharing')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.privacyPolicy.dataStoring',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.privacyPolicy.dataStoring')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.privacyPolicy.description',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.privacyPolicy.description')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.privacyPolicy.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.privacyPolicy.title')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.refundPolicy.description',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.refundPolicy.description')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.refundPolicy.moneyBack',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.refundPolicy.moneyBack')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.refundPolicy.returnOrCancel',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.refundPolicy.returnOrCancel')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.refundPolicy.returnProcess',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.refundPolicy.returnProcess')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.refundPolicy.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.refundPolicy.title')],
        },
        {
            publicKey: 'payByLink.settings.terms.requirements.title',
            targets: [payByLinkTarget('payByLink.settings.terms.requirements.title')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.alert.urlChange',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.alert.urlChange')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.error.requirementsNotChecked',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.error.requirementsNotChecked')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.error.urlValidation',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.error.urlValidation')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.errors.couldNotLoad',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.errors.couldNotLoad')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.requirement.checkbox.part1',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.requirement.checkbox.part1')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.requirement.checkbox.part2',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.requirement.checkbox.part2')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.subtitle',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.subtitle')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.title',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.title')],
        },
        {
            publicKey: 'payByLink.settings.termsAndConditions.urlInput.label',
            targets: [payByLinkTarget('payByLink.settings.termsAndConditions.urlInput.label')],
        },
        {
            publicKey: 'payByLink.settings.theme.action.logo.remove',
            targets: [payByLinkTarget('payByLink.settings.theme.action.logo.remove')],
        },
        {
            publicKey: 'payByLink.settings.theme.brandName.input.label',
            targets: [payByLinkTarget('payByLink.settings.theme.brandName.input.label')],
        },
        {
            publicKey: 'payByLink.settings.theme.brandName.input.placeholder',
            targets: [payByLinkTarget('payByLink.settings.theme.brandName.input.placeholder')],
        },
        {
            publicKey: 'payByLink.settings.theme.errors.couldNotLoad',
            targets: [payByLinkTarget('payByLink.settings.theme.errors.couldNotLoad')],
        },
        {
            publicKey: 'payByLink.settings.theme.inputs.brandName.errors.missing',
            targets: [payByLinkTarget('payByLink.settings.theme.inputs.brandName.errors.missing')],
        },
        {
            publicKey: 'payByLink.settings.theme.limitations.file.input.imageSize.text',
            targets: [payByLinkTarget('payByLink.settings.theme.limitations.file.input.imageSize.text')],
        },
        {
            publicKey: 'payByLink.settings.theme.limitations.file.input.maxSize.text',
            targets: [payByLinkTarget('payByLink.settings.theme.limitations.file.input.maxSize.text')],
        },
        {
            publicKey: 'payByLink.settings.theme.limitations.file.input.supportedFile.text',
            targets: [payByLinkTarget('payByLink.settings.theme.limitations.file.input.supportedFile.text')],
        },
        {
            publicKey: 'payByLink.settings.theme.logo.input.label',
            targets: [payByLinkTarget('payByLink.settings.theme.logo.input.label')],
        },
        {
            publicKey: 'payByLink.settings.theme.subtitle',
            targets: [payByLinkTarget('payByLink.settings.theme.subtitle')],
        },
        {
            publicKey: 'payByLink.settings.theme.title',
            targets: [payByLinkTarget('payByLink.settings.theme.title')],
        },
        {
            publicKey: 'payByLink.settings.theme.wideLogo.input.label',
            targets: [payByLinkTarget('payByLink.settings.theme.wideLogo.input.label')],
        },
        {
            publicKey: 'payByLink.settings.themes.inputs.file.errors.fullWidthLogo.invalidDimensions',
            targets: [payByLinkTarget('payByLink.settings.themes.inputs.file.errors.fullWidthLogo.invalidDimensions')],
        },
        {
            publicKey: 'payByLink.settings.themes.inputs.file.errors.logo.invalidDimensions',
            targets: [payByLinkTarget('payByLink.settings.themes.inputs.file.errors.logo.invalidDimensions')],
        },
        {
            publicKey: 'payByLink.settings.title',
            targets: [payByLinkTarget('payByLink.settings.title')],
        },
    ],
} as const satisfies TranslationContractRegistry;
