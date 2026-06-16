import { useEffect } from 'react';
import { PaymentLinkDetails as PaymentLinkDetailsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinkDetails = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const paymentLinkDetails = new PaymentLinkDetailsAdyen({
            core: adyenInstance.core,
            id: 'PL05C5E49B25663349EA672A0',
        });
        paymentLinkDetails.mount('#payment-link-details-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="payment-link-details-container" className="component-narrow" />;
};
