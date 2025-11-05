import { PayByLinkOverview } from './PayByLinkOverview';
import type { ExternalUIComponentProps, PayByLinkOverviewComponentProps } from '../../../types';
import usePayByLinkFilters from '../../../../hooks/usePayByLinkFilters';
import './PayByLink.scss';

function PayByLinkOverviewContainer({ ...props }: ExternalUIComponentProps<PayByLinkOverviewComponentProps>) {
    //TODO: Add error case
    const { filters, isFetching, error } = usePayByLinkFilters();

    return (
        <>
            <PayByLinkOverview {...props} filters={filters} isFiltersLoading={isFetching} />
        </>
    );
}

export default PayByLinkOverviewContainer;
