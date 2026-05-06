import { createDynamicTranslationFactory, createKeyFactoryFromConfig } from '@integration-components/core';
import type { TranslationFallbackFunction } from '@integration-components/core';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const payoutAdjustmentTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.adjustments.types.' });
export const getPayoutAdjustmentType = createDynamicTranslationFactory(payoutAdjustmentTypeKeyFactory, originalValueFallback);

const payoutFundsCapturedTypeKeyFactory = createKeyFactoryFromConfig({ prefix: 'payouts.details.breakdown.fundsCaptured.types.' });
export const getPayoutFundsCapturedType = createDynamicTranslationFactory(payoutFundsCapturedTypeKeyFactory, originalValueFallback);
