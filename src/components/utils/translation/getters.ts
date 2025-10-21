import { createDynamicTranslationFactory, createKeyFactoryFromConfig, KeyFactoryFunction, TranslationFallbackFunction } from './factory';
import { DISPUTE_REASON_CATEGORIES, DISPUTE_STATUSES, DISPUTE_TYPES } from '../disputes/constants';
import { REFUND_REASONS_KEYS } from '../../external/TransactionDetails/context/constants';
import { IDisputeReasonCategory, IDisputeStatus, IDisputeType } from '../../../types/api/models/disputes';
import { RefundReason } from '../../external/TransactionDetails/context/types';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const payoutAdjustmentTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.adjustments.types.' });
export const getPayoutAdjustmentType = createDynamicTranslationFactory(payoutAdjustmentTypeKeyFactory, originalValueFallback);

const payoutFundsCapturedTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.fundsCaptured.types.' });
export const getPayoutFundsCapturedType = createDynamicTranslationFactory(payoutFundsCapturedTypeKeyFactory, originalValueFallback);

const reportTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'reports.common.types.' });
export const getReportType = createDynamicTranslationFactory(reportTypeKeyFactory, originalValueFallback);

const txCategoryKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.' });
export const getTransactionCategory = createDynamicTranslationFactory(txCategoryKeyFactory, originalValueFallback);

const txCategoryDescriptionKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.', suffix: '.description' });
export const getTransactionCategoryDescription = createDynamicTranslationFactory(txCategoryDescriptionKeyFactory);

const txStatusKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.statuses.' });
export const getTransactionStatus = createDynamicTranslationFactory(txStatusKeyFactory, originalValueFallback);

const txRefundReasonKey = createKeyFactoryFromConfig({ prefix: 'transactions.details.common.refundReasons.' });
const txRefundReasonKeyFactory: KeyFactoryFunction = reason => reason && (REFUND_REASONS_KEYS[reason as RefundReason] ?? txRefundReasonKey(reason));
export const getTransactionRefundReason = createDynamicTranslationFactory(txRefundReasonKeyFactory, originalValueFallback);

const disputeReasonKey = createKeyFactoryFromConfig({ prefix: 'disputes.common.reasonCategories.' });
const disputeReasonKeyFactory: KeyFactoryFunction = reason =>
    reason && (DISPUTE_REASON_CATEGORIES[reason as IDisputeReasonCategory] ?? disputeReasonKey(reason));
export const getDisputeReason = createDynamicTranslationFactory(disputeReasonKeyFactory, originalValueFallback);

const disputeStatusKey = createKeyFactoryFromConfig({ prefix: 'disputes.common.statuses.' });
const disputeStatusKeyFactory: KeyFactoryFunction = status => status && (DISPUTE_STATUSES[status as IDisputeStatus] ?? disputeStatusKey(status));
export const getDisputeStatus = createDynamicTranslationFactory(disputeStatusKeyFactory, originalValueFallback);

const disputeTypeKey = createKeyFactoryFromConfig({ prefix: 'disputes.management.details.types.' });
const disputeTypeKeyFactory: KeyFactoryFunction = type => type && (DISPUTE_TYPES[type as IDisputeType] ?? disputeTypeKey(type));
export const getDisputeType = createDynamicTranslationFactory(disputeTypeKeyFactory, originalValueFallback);
