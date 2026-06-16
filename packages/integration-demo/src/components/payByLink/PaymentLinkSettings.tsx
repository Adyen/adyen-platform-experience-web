import { useEffect } from 'react';
import { PaymentLinkSettings as PaymentLinkSettingsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkSettings = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const paymentLinkSettings = new PaymentLinkSettingsAdyen({
            core: adyenInstance.core,
        });
        paymentLinkSettings.mount('#payment-link-settings-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="payment-link-settings-container" className="component-narrow" />;
};
