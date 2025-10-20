import { createDynamicTranslationFactory, createKeyFactoryFromConfig, KeyFactoryFunction, TranslationFallbackFunction } from './factory';
import { REFUND_REASONS_KEYS } from '../../external/TransactionDetails/context/constants';
import { RefundReason } from '../../external/TransactionDetails/context/types';
import { IDisputeStatus } from '../../../types/api/models/disputes';
import { DISPUTE_STATUSES } from '../disputes/constants';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const reportTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'reports.common.types.' });
export const getReportType = createDynamicTranslationFactory(reportTypeKeyFactory, originalValueFallback);

const txCategoryKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.' });
export const getTransactionCategory = createDynamicTranslationFactory(txCategoryKeyFactory, originalValueFallback);

const txCategoryDescriptionKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.', suffix: '.description' });
export const getTransactionCategoryDescription = createDynamicTranslationFactory(txCategoryDescriptionKeyFactory);

const txStatusKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.statuses.' });
export const getTranslationStatus = createDynamicTranslationFactory(txStatusKeyFactory, originalValueFallback);

const txRefundReasonKey = createKeyFactoryFromConfig({ prefix: 'transactions.details.common.refundReasons.' });
const txRefundReasonKeyFactory: KeyFactoryFunction = reason => reason && (REFUND_REASONS_KEYS[reason as RefundReason] ?? txRefundReasonKey(reason));
export const getTransactionRefundReason = createDynamicTranslationFactory(txRefundReasonKeyFactory, originalValueFallback);

const disputeStatusKey = createKeyFactoryFromConfig({ prefix: 'disputes.common.statuses.' });
const disputeStatusKeyFactory: KeyFactoryFunction = status => status && (DISPUTE_STATUSES[status as IDisputeStatus] ?? disputeStatusKey(status));
export const getDisputeStatus = createDynamicTranslationFactory(disputeStatusKeyFactory, originalValueFallback);
