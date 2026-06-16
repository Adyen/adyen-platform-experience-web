import { useEffect } from 'react';
import { TransactionDetails as TransactionDetailsAdyen } from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

export const TransactionDetails = () => {
    const initializeComponent = async () => {
        const adyenInstance = await AdyenPlatformExperience.getInstance();

        const transactionsOverview = new TransactionDetailsAdyen({
            core: adyenInstance.core,
            id: 'EVJN42CQQ223224B5PJFH9N3SZ2LTSEUR',
        });
        transactionsOverview.mount('#transaction-details-container');
    };

    useEffect(() => {
        initializeComponent();
    }, []);

    return <div id="transaction-details-container" className="component-narrow"></div>;
};
