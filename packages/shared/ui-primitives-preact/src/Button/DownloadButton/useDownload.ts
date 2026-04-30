import { useConfigContext } from '../../../../../../src/core/ConfigContext';
import { useFetch } from '../../../../../../src/hooks/useFetch';
import { DownloadStreamEndpoint, EndpointDownloadStreamData } from '../../../../../../src/types/api/endpoints';
import { EMPTY_OBJECT } from '../../../../../../src/utils';

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
