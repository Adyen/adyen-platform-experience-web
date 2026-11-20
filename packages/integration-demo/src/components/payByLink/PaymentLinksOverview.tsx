import { useEffect } from 'react';
import { PaymentLinksOverview as PaymentLinksOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinksOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PaymentLinksOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PaymentLinksOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#payment-links-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payment-links-overview-container" />;
};
