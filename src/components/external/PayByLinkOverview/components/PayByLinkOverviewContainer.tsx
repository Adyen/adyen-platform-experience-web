import { PayByLinkOverview } from './PayByLinkOverview';
import type { ExternalUIComponentProps, PayByLinkOverviewComponentProps } from '../../../types';
import usePayByLinkFilters from '../../../../hooks/usePayByLinkFilters';
import './PayByLink.scss';

function PayByLinkOverviewContainer({ ...props }: ExternalUIComponentProps<PayByLinkOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, stores, filterError, storeError } = usePayByLinkFilters(props?.storeIds, false);

    return (
        <>
            <PayByLinkOverview {...props} filterParams={filters} stores={stores} isFiltersLoading={isFetching} />
        </>
    );
}

export default PayByLinkOverviewContainer;
