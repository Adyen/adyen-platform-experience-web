import { IPaymentLinkItem } from '../../../../types';
import { PAYMENT_LINKS_TABLE_FIELDS } from './PaymentLinkTable';
import { StringWithAutocompleteOptions } from '../../../../utils/types';
import { PaginationProps, WithPaginationLimitSelection } from '../../../internal/Pagination/types';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { IStore } from '../../../../types/api/models/stores';

export type PaymentLinkTableCols = (typeof PAYMENT_LINKS_TABLE_FIELDS)[number];
export type PaymentLinkTableFields = StringWithAutocompleteOptions<PaymentLinkTableCols>;

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
}

export type StoreData = IStore & { name?: string };

export type PaymentLinkOverviewModalType = 'Creation' | 'Settings';
