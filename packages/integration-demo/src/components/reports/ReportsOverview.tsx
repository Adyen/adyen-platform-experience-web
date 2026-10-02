import { useEffect } from 'react';
import { ReportsOverview as ReportsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const ReportsOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: ReportsOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new ReportsOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#reports-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="reports-overview-container" />;
};
