import type { MixpanelProperty } from '@integration-components/core/EventDispatcher/eventDispatcher/user-events';

export const getFilterAnalyticsValue = (field: string, value: unknown): MixpanelProperty => {
    if (field === 'paymentPspReference') return null;
    if (Array.isArray(value)) return value.join(',');
    return value as MixpanelProperty;
};
