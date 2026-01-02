import { IPaymentLinkItem } from '../../../../types';
import { PAY_BY_LINK_TABLE_FIELDS } from './PayByLinkTable';
import { StringWithAutocompleteOptions } from '../../../../utils/types';
import { PaginationProps, WithPaginationLimitSelection } from '../../../internal/Pagination/types';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';
import { IStore } from '../../../../types/api/models/stores';

export type PayByLinkTableCols = (typeof PAY_BY_LINK_TABLE_FIELDS)[number];
export type PayByLinkTableFields = StringWithAutocompleteOptions<PayByLinkTableCols>;

export interface PayByLinkTableProps extends WithPaginationLimitSelection<PaginationProps> {
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

export type PayByLinkOverviewModalType = 'LinkCreation' | 'Settings';
