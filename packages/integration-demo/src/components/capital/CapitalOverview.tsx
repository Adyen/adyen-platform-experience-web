import { useEffect } from 'react';
import { CapitalOverview as CapitalOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const CapitalOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: CapitalOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new CapitalOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#capital-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="capital-overview-container" className="component-narrow"></div>;
};
