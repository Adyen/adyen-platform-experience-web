import { useEffect } from 'react';
import { PayoutDetails as PayoutDetailsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const PayoutDetails = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: PayoutDetailsAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new PayoutDetailsAdyen({
                core: adyenInstance.core,
                date: '2025-06-13T00:00:00.000+00:00',
                id: 'BA32CKZ223227T5L6834T3LBX',
            });
            componentInstance.mount('#payout-details-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="payout-details-container" className="component-narrow" />;
};
