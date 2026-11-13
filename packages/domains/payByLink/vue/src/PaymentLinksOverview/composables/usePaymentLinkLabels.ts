import { useCoreContext } from '@integration-components/core/vue';
import { getPaymentLinkStatus, getPaymentLinkType } from '@integration-components/payByLink/domain';

export function usePaymentLinkLabels() {
    const { i18n } = useCoreContext();

    function getStatusLabel(status: string): string {
        return getPaymentLinkStatus(i18n, status) ?? status;
    }

    function getLinkTypeLabel(linkType: string): string {
        return getPaymentLinkType(i18n, linkType) ?? linkType;
    }

    return { getStatusLabel, getLinkTypeLabel } as const;
}

export default usePaymentLinkLabels;
