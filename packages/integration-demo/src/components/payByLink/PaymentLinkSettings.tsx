import { useEffect } from 'react';
import { PaymentLinkSettings as PaymentLinkSettingsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkSettings = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PaymentLinkSettingsAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PaymentLinkSettingsAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#payment-link-settings-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payment-link-settings-container" className="component-narrow" />;
};
