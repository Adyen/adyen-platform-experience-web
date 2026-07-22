import { useEffect, useState } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import localSupportedRegions from '../../../../domain/src/config/supportedRegions.json';
import { getSupportedRegions, SupportedRegions } from './getSupportedRegions';

export const useSupportedRegions = (): SupportedRegions => {
    const { getCdnConfig } = useCoreContext();
    const [supportedRegions, setSupportedRegions] = useState<SupportedRegions>(localSupportedRegions);

    useEffect(() => {
        void getSupportedRegions(getCdnConfig).then(setSupportedRegions);
    }, [getCdnConfig]);

    return supportedRegions;
};
