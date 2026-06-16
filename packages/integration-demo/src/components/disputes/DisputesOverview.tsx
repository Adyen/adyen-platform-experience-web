import { useEffect } from 'react';
import { DisputesOverview as DisputesOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const DisputesOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const disputesOverview = new DisputesOverviewAdyen({
            core: adyenInstance.core,
        });
        disputesOverview.mount('#disputes-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="disputes-overview-container" />;
};
