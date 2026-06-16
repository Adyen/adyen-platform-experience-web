import { useEffect } from 'react';
import { DisputeManagement as DisputeManagementAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const DisputeManagement = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const disputeManagement = new DisputeManagementAdyen({
            core: adyenInstance.core,
            id: 'D2CT6C4NZM27Z5V5',
        });
        disputeManagement.mount('#dispute-management-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="dispute-management-container" className="component-narrow" />;
};
