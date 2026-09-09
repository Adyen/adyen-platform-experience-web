import { useEffect } from 'react';
import { PaymentLinkCreation as PaymentLinkCreationAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkCreation = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PaymentLinkCreationAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PaymentLinkCreationAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#payment-link-creation-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payment-link-creation-container" className="component-narrow" />;
};
