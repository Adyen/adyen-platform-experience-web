import { useEffect } from 'react';
import { TransactionsOverview as TransactionsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const TransactionsOverview = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: TransactionsOverviewAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new TransactionsOverviewAdyen({
                core: adyenInstance.core,
            });
            componentInstance.mount('#transactions-overview-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="transactions-overview-container" />;
};
