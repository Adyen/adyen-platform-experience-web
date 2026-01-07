import { PaymentLinkOverview } from './PaymentLinkOverview';
import type { ExternalUIComponentProps, PaymentLinkOverviewComponentProps } from '../../../types';
import usePaymentLinkFilters from '../../../../hooks/usePaymentLinkFilters';
import './PaymentLink.scss';

function PaymentLinkOverviewContainer({ ...props }: ExternalUIComponentProps<PaymentLinkOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, stores, filterError, storeError } = usePaymentLinkFilters(props?.storeIds);

    return (
        <PaymentLinkOverview
            {...props}
            filterParams={filters}
            stores={stores}
            isFiltersLoading={isFetching}
            filterError={filterError}
            storeError={storeError}
        />
    );
}

export default PaymentLinkOverviewContainer;
