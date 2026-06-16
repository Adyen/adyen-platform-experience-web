import { useEffect } from 'react';
import { TransactionDetails as TransactionDetailsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const TransactionDetails = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: TransactionDetailsAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new TransactionDetailsAdyen({
                core: adyenInstance.core,
                id: 'EVJN42CQQ223224B5PJFH9N3SZ2LTSEUR',
            });
            componentInstance.mount('#transaction-details-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="transaction-details-container" className="component-narrow"></div>;
};
