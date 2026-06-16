import { useEffect } from 'react';
import { TransactionsOverview as TransactionsOverviewAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const TransactionsOverview = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const transactionsOverview = new TransactionsOverviewAdyen({
            core: adyenInstance.core,
        });
        transactionsOverview.mount('#transactions-overview-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="transactions-overview-container" />;
};
