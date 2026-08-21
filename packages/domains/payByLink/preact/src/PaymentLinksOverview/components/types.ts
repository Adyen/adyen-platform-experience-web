import { IPaymentLinkItem } from '@integration-components/types';
import { PaginationProps, WithPaginationLimitSelection } from '@integration-components/ui-components-preact/Pagination/types';
import { AdyenPlatformExperienceError } from '@integration-components/core';
import type { PaymentLinkTableCols, PaymentLinkTableFields, PaymentLinksOverviewModalType, StoreData } from '../../../../domain/src';

export type { PaymentLinkTableCols, PaymentLinkTableFields, PaymentLinksOverviewModalType, StoreData };

export interface PaymentLinkTableProps extends WithPaginationLimitSelection<PaginationProps> {
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    onContactSupport?: () => void;
    onRowClick: (value: IPaymentLinkItem) => void;
    showDetails?: boolean;
    showPagination: boolean;
    paymentLinks: IPaymentLinkItem[] | undefined;
    stores?: StoreData[];
    storeError?: AdyenPlatformExperienceError;
    allStores?: StoreData[];
}
