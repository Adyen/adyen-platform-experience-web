import { PaymentLinksOverview } from './PaymentLinksOverview';
import type { ExternalUIComponentProps, PaymentLinksOverviewComponentProps } from '../../../types';
import usePaymentLinkFilters from '../../../../hooks/usePaymentLinkFilters';
import './PaymentLinksOverview.scss';

function PaymentLinksOverviewContainer({ ...props }: ExternalUIComponentProps<PaymentLinksOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, stores, filterError, allStores, storeError } = usePaymentLinkFilters(props?.storeIds);

    return (
        <PaymentLinksOverview
            {...props}
            filterParams={filters}
            stores={stores}
            allStores={allStores}
            isFiltersLoading={isFetching}
            filterError={filterError}
            storeError={storeError}
        />
    );
}

export default PaymentLinksOverviewContainer;
