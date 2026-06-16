import { useEffect, useState } from 'react';
import {
    CapitalComponentState,
    CapitalOffer as CapitalOfferAdyen,
    CapitalOverview as CapitalOverviewAdyen,
} from '@adyen/adyen-platform-experience-web';
import { AdyenPlatformExperience } from '../../AdyenPlatformExperience';

import { useNavigate } from 'react-router';

export const CapitalOffer = () => {
    const [capitalState, setCapitalState] = useState<CapitalComponentState['state']>();
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();

            const capitalOverview = new CapitalOverviewAdyen({
                core: adyenInstance.core,
            });

            const { state } = await capitalOverview.getState();
            setCapitalState(state);

            if (state === 'isPreQualified') {
                const capitalOffer = new CapitalOfferAdyen({
                    core: adyenInstance.core,
                    onFundsRequest: () => {
                        navigate('/');
                    },
                });
                capitalOffer.mount('#capital-offer-container');
            }
        })();
    }, [navigate]);

    if (capitalState === 'isUnqualified') {
        return <div>{'User is not qualified for capital.'}</div>;
    }

    if (capitalState === 'hasRequestedGrants') {
        return <div>{'User already has an active grant.'}</div>;
    }

    return <div id="capital-offer-container" className="component-narrow"></div>;
};
