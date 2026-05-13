import { createDynamicTranslationFactory, createKeyFactoryFromConfig } from '@integration-components/core';
import type { KeyFactoryFunction, TranslationFallbackFunction, TranslationKey } from '@integration-components/core';
import type { IRefundReason } from '@integration-components/types';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const txAmountAdjustmentTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.details.summary.adjustments.types.' });
export const getTransactionAmountAdjustmentType = createDynamicTranslationFactory(txAmountAdjustmentTypeKeyFactory, originalValueFallback);

const txAmountAdjustmentInformationKeyFactory = createKeyFactoryFromConfig({
    prefix: 'transactions.details.summary.adjustments.types.',
    suffix: '.information',
});
export const getTransactionAmountAdjustmentTypeInformation = createDynamicTranslationFactory(txAmountAdjustmentInformationKeyFactory);

const txCategoryKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.' });
export const getTransactionCategory = createDynamicTranslationFactory(txCategoryKeyFactory, originalValueFallback);

const txCategoryDescriptionKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.types.', suffix: '.description' });
export const getTransactionCategoryDescription = createDynamicTranslationFactory(txCategoryDescriptionKeyFactory);

const txStatusKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.common.statuses.' });
export const getTransactionStatus = createDynamicTranslationFactory(txStatusKeyFactory, originalValueFallback);

const txTimelineStatusKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.details.timeline.statuses.' });
export const getTransactionTimelineTxStatus = createDynamicTranslationFactory(txTimelineStatusKeyFactory, originalValueFallback);

const txTimelineTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'transactions.details.timeline.types.' });
export const getTransactionTimelineTxType = createDynamicTranslationFactory(txTimelineTypeKeyFactory, originalValueFallback);

export const REFUND_REASONS_KEYS = Object.freeze({
    requested_by_customer: 'transactions.details.common.refundReasons.requestedByCustomer',
    issue_with_item_sold: 'transactions.details.common.refundReasons.issueWithItemSold',
    fraudulent: 'transactions.details.common.refundReasons.fraudulent',
    duplicate: 'transactions.details.common.refundReasons.duplicate',
    other: 'transactions.details.common.refundReasons.other',
} as const) satisfies Readonly<Record<IRefundReason, TranslationKey>>;

const txRefundReasonKey = createKeyFactoryFromConfig({ prefix: 'transactions.details.common.refundReasons.' });
const txRefundReasonKeyFactory: KeyFactoryFunction = reason => reason && (REFUND_REASONS_KEYS[reason as IRefundReason] ?? txRefundReasonKey(reason));
export const getTransactionRefundReason = createDynamicTranslationFactory(txRefundReasonKeyFactory, originalValueFallback);
