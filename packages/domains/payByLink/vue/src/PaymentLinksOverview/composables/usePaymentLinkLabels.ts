import { PAYMENT_LINK_STATUSES, PAYMENT_LINK_TYPES } from '../constants';
import type { IPaymentLinkStatus, IPaymentLinkType } from '@integration-components/types';
import { usePayByLinkContext } from '../../integration/context';

/**
 * Resolves human-readable labels for payment link statuses and link types,
 * falling back to the raw value when no translation key is registered so the
 * UI never renders an empty label for unknown values.
 */
export function usePaymentLinkLabels() {
    const { i18n } = usePayByLinkContext();

    function getStatusLabel(status: string): string {
        const translationKey = PAYMENT_LINK_STATUSES[status as IPaymentLinkStatus];
        return translationKey ? i18n.get(translationKey) : status;
    }

    function getLinkTypeLabel(linkType: string): string {
        const translationKey = PAYMENT_LINK_TYPES[linkType as IPaymentLinkType];
        return translationKey ? i18n.get(translationKey) : linkType;
    }

    return { getStatusLabel, getLinkTypeLabel } as const;
}

export default usePaymentLinkLabels;
