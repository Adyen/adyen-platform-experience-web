import { useEffect } from 'react';
import { ReportsOverview as ReportsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const ReportsOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const reportsOverview = new ReportsOverviewAdyen({
            core: adyenInstance.core,
        });
        reportsOverview.mount('#reports-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="reports-overview-container" />;
};
