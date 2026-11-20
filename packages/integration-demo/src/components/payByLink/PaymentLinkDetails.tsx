import { useEffect } from 'react';
import { PaymentLinkDetails as PaymentLinkDetailsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkDetails = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PaymentLinkDetailsAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PaymentLinkDetailsAdyen({
                core: adyenInstance.core,
                id: 'PL8D69B30E23D36CF74F2520D',
            });
            componentInstance.mount('#payment-link-details-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payment-link-details-container" className="component-narrow" />;
};
