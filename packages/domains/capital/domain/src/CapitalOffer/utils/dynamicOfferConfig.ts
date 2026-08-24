import type { IDynamicOffersConfig } from '@integration-components/types';
import type { EnhancedCapitalState } from '../../shared';

export const getDynamicOfferConfig = (state: EnhancedCapitalState): IDynamicOffersConfig | undefined => {
    const config = state.dynamicOffer;
    const minRenewalAmount = state.renewableGrants[0]?.renewal?.minimumRenewalAmount;
    if (!config || minRenewalAmount?.value === undefined) return config;

    const { minAmount, step } = config;
    const minValue = Math.max(minRenewalAmount.value, minAmount.value);
    const adjustedMinValue = Math.ceil(minValue / step) * step;

    return {
        ...config,
        minAmount: { ...minAmount, value: adjustedMinValue },
    };
};

export const getCurrency = (config: IDynamicOffersConfig) => config.minAmount.currency;

export const getDefaultAmountValue = (config: IDynamicOffersConfig) => {
    const minValue = config.minAmount.value;
    const maxValue = config.maxAmount.value;
    const step = config.step;
    const midValue = (maxValue - minValue) / 2 + minValue;
    const adjustedMedianValue = Math.round(midValue / step) * step;
    return Math.min(Math.max(adjustedMedianValue, minValue), maxValue);
};

export const getEstimatedTerms = (config: IDynamicOffersConfig) => {
    return config ? [...config.estimatedRepaymentTermsInDays].sort((a, b) => a - b) : [];
};
