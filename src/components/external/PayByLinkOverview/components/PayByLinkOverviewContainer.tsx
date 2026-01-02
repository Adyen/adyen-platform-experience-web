import { PayByLinkOverview } from './PayByLinkOverview';
import type { ExternalUIComponentProps, PayByLinkOverviewComponentProps } from '../../../types';
import usePayByLinkFilters from '../../../../hooks/usePayByLinkFilters';
import './PayByLink.scss';

function PayByLinkOverviewContainer({ ...props }: ExternalUIComponentProps<PayByLinkOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, stores, filterError, storeError } = usePayByLinkFilters(props?.storeIds);

    return (
        <PayByLinkOverview
            {...props}
            filterParams={filters}
            stores={stores}
            isFiltersLoading={isFetching}
            filterError={filterError}
            storeError={storeError}
        />
    );
}

export default PayByLinkOverviewContainer;
