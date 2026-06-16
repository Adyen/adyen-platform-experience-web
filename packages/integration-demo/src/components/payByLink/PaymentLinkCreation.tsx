import { useEffect } from 'react';
import { PaymentLinkCreation as PaymentLinkCreationAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkCreation = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const paymentLinkCreation = new PaymentLinkCreationAdyen({
            core: adyenInstance.core,
        });
        paymentLinkCreation.mount('#payment-link-creation-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="payment-link-creation-container" className="component-narrow" />;
};
