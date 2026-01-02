import { useConfigContext } from '../../../../core/ConfigContext';
import { useFetch } from '../../../../hooks/useFetch';
import { DownloadStreamEndpoint } from '../../../../types/api/endpoints';
import { EMPTY_OBJECT } from '../../../../utils';

const useDownload = (endpointName: DownloadStreamEndpoint, queryParam?: any, enabled?: boolean) => {
    const downloadEndpoint = useConfigContext().endpoints[endpointName];

    return useFetch({
        fetchOptions: { enabled: !!downloadEndpoint && enabled, keepPrevData: true },
        queryFn: async () => {
            return downloadEndpoint!(EMPTY_OBJECT as any, { ...queryParam });
        },
    });
};

export default useDownload;
