import { useEffect } from 'react';
import { DisputesOverview as DisputesOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const DisputesOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: DisputesOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new DisputesOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#disputes-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="disputes-overview-container" />;
};
