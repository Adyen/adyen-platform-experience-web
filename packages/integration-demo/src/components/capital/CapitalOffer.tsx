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
        let isMounted = true;
        let componentInstance: CapitalOfferAdyen | null = null;

        (async () => {
            const adyenInstance = await AdyenPlatformExperience.getInstance();
            if (!isMounted) return;

            const capitalOverview = new CapitalOverviewAdyen({
                core: adyenInstance.core,
            });

            const { state } = await capitalOverview.getState();
            if (!isMounted) return;
            setCapitalState(state);

            if (state === 'isPreQualified') {
                componentInstance = new CapitalOfferAdyen({
                    core: adyenInstance.core,
                    onFundsRequest: () => {
                        navigate('/');
                    },
                });
                componentInstance.mount('#capital-offer-container');
            }
        })();

        return () => {
            isMounted = false;
            componentInstance?.unmount();
        };
    }, [navigate]);

    if (capitalState === 'isUnqualified') {
        return <div>{'User is not qualified for capital.'}</div>;
    }

    if (capitalState === 'hasRequestedGrants') {
        return <div>{'User already has an active grant.'}</div>;
    }

    return <div id="capital-offer-container" className="component-narrow"></div>;
};
