import { IPaymentLinkItem } from '../../../../types';
import { PAY_BY_LINK_TABLE_FIELDS } from './PayByLinkTable';
import { StringWithAutocompleteOptions } from '../../../../utils/types';
import { PaginationProps, WithPaginationLimitSelection } from '../../../internal/Pagination/types';
import AdyenPlatformExperienceError from '../../../../core/Errors/AdyenPlatformExperienceError';

export type PayByLinkTableCols = (typeof PAY_BY_LINK_TABLE_FIELDS)[number];
export type PayByLinkTableFields = StringWithAutocompleteOptions<PayByLinkTableCols>;

export interface PayByLinkTableProps extends WithPaginationLimitSelection<PaginationProps> {
    availableCurrencies: IPaymentLinkItem['amount']['currency'][] | undefined;
    loading: boolean;
    error: AdyenPlatformExperienceError | undefined;
    hasMultipleCurrencies: boolean;
    onContactSupport?: () => void;
    onRowClick: (value: IPaymentLinkItem) => void;
    showDetails?: boolean;
    showPagination: boolean;
    paymentLinks: IPaymentLinkItem[] | undefined;
}
