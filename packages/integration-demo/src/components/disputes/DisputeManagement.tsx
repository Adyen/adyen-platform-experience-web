import { useEffect } from 'react';
import { DisputeManagement as DisputeManagementAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const DisputeManagement = () => {
    useEffect(() => {
        let isMounted = true;
        let componentInstance: DisputeManagementAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            componentInstance = new DisputeManagementAdyen({
                core: adyenInstance.core,
                id: 'RX8VWGR5HTX9MH75',
            });
            componentInstance.mount('#dispute-management-container');
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, []);

    return <div id="dispute-management-container" className="component-narrow" />;
};
