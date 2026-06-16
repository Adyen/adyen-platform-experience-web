import { useEffect } from 'react';
import { CapitalOverview as CapitalOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const CapitalOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const capitalOverview = new CapitalOverviewAdyen({
            core: adyenInstance.core,
        });

        capitalOverview.mount('#capital-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="capital-overview-container" className="component-narrow"></div>;
};
