import { useEffect } from 'react';
import { PaymentLinksOverview as PaymentLinksOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PaymentLinksOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const paymentLinksOverview = new PaymentLinksOverviewAdyen({
            core: adyenInstance.core,
        });
        paymentLinksOverview.mount('#payment-links-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="payment-links-overview-container" />;
};
