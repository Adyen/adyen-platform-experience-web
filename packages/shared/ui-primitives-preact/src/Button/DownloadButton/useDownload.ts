import { useConfigContext } from '@integration-components/core/preact';
import { useFetch } from '@integration-components/hooks-preact/useFetch';
import type { DownloadStreamEndpoint, EndpointDownloadStreamData } from '@integration-components/types/api/endpoints';
import { EMPTY_OBJECT } from '@integration-components/utils';

const useDownload = (
    endpointName: DownloadStreamEndpoint,
    queryParam?: any,
    enabled?: boolean,
    onSuccess?: (data: EndpointDownloadStreamData) => void
) => {
    const downloadEndpoint = useConfigContext().endpoints[endpointName];

    return useFetch({
        fetchOptions: { enabled: !!downloadEndpoint && enabled, keepPrevData: true, onSuccess },
        queryFn: async () => {
            return downloadEndpoint!(EMPTY_OBJECT as any, { ...queryParam });
        },
    });
};

export default useDownload;
