import { PayByLinkOverview } from './PayByLinkOverview';
import type { ExternalUIComponentProps, PayByLinkOverviewComponentProps } from '../../../types';
import usePayByLinkFilters from '../../../../hooks/usePayByLinkFilters';
import './PayByLink.scss';
import Spinner from '../../../internal/Spinner';

function PayByLinkOverviewContainer({ ...props }: ExternalUIComponentProps<PayByLinkOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, stores, error } = usePayByLinkFilters();

    //TODO: Change loading filters case
    if (isFetching) return <Spinner />;

    //TODO: Change error
    if (!stores?.data || stores?.data?.length === 0) return <>Stores cannot be loaded</>;

    return (
        <>
            <PayByLinkOverview {...props} filterParams={filters} stores={stores.data} isFiltersLoading={isFetching} />
        </>
    );
}

export default PayByLinkOverviewContainer;
