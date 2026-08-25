import { useCallback, useEffect, useState } from 'preact/hooks';
import { useCoreContext } from '@integration-components/core/preact';
import { DEFAULT_POLLING_CONFIG, getPollingConfig as getDomainPollingConfig } from '@integration-components/capital/domain';

export type { MissingActionsPollingConfig, PollingConfig } from '@integration-components/capital/domain';

export const usePollingConfig = () => {
    const { getCdnConfig } = useCoreContext();
    const [pollingConfig, setPollingConfig] = useState(DEFAULT_POLLING_CONFIG);

    const getPollingConfig = useCallback(async () => {
        setPollingConfig(await getDomainPollingConfig(getCdnConfig));
    }, [getCdnConfig]);

    useEffect(() => {
        void getPollingConfig();
    }, [getPollingConfig]);

    return { pollingConfig, getPollingConfig };
};
