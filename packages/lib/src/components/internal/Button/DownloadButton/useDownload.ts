import { useMemo } from 'preact/hooks';
import { useAuthContext } from '../../../../core/Auth';
import { useFetch } from '../../../../hooks/useFetch/useFetch';
import { EndpointName } from '../../../../types/api/endpoints';
import { EMPTY_OBJECT } from '../../../../utils';

const useDownload = (endpointName: EndpointName, queryParam?: any, enabled?: boolean) => {
    const downloadEndpoint = useAuthContext().endpoints[endpointName] as any;

    const { data, isFetching } = useFetch({
        fetchOptions: { enabled: !!downloadEndpoint && enabled, keepPrevData: true },
        queryFn: async () => {
            return downloadEndpoint!(EMPTY_OBJECT, { ...queryParam });
        },
    });

    return { data, isFetching } as const;
};

export default useDownload;
