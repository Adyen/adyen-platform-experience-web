import { useEffect } from 'react';
import { PayoutsOverview as PayoutsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PayoutsOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PayoutsOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PayoutsOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#payouts-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payouts-overview-container" />;
};
