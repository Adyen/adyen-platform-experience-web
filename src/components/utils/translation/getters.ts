import { createDynamicTranslationFactory, createKeyFactoryFromConfig } from '@integration-components/core';
import type { KeyFactoryFunction, TranslationFallbackFunction } from '@integration-components/core';
import { IDisputeReasonCategory, IDisputeStatus, IDisputeType } from '../../../types/api/models/disputes';
import { DISPUTE_REASON_CATEGORIES, DISPUTE_STATUSES, DISPUTE_TYPES } from '../disputes/constants';

export { getReportType } from '@integration-components/reports/domain';
export { getPayoutAdjustmentType, getPayoutFundsCapturedType } from '@integration-components/payouts/domain';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

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
