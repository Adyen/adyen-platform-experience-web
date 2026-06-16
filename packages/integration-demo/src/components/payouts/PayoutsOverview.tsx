import { useEffect } from 'react';
import { PayoutsOverview as PayoutsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PayoutsOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const payoutsOverview = new PayoutsOverviewAdyen({
            core: adyenInstance.core,
        });
        payoutsOverview.mount('#payouts-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="payouts-overview-container" />;
};
