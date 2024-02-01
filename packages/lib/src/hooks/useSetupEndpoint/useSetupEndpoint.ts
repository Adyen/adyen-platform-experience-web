import useAuthContext from '@src/core/Auth/useAuthContext';
import { EndpointName } from '@src/types/models/api/utils';
import useSessionAwareRequest from '@src/hooks/useSessionAwareRequest/useSessionAwareRequest';

interface UseSetupEndpointProps {
    endpoint: EndpointName;
}
export const useSetupEndpoint = ({ endpoint }: UseSetupEndpointProps) => {
    const { endpoints } = useAuthContext();

    const { httpProvider } = useSessionAwareRequest();

    // util(endpoints[endpoint], { transactionIds: '134e32' });
};
