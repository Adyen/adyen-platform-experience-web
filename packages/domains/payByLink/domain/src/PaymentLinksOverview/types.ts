import type { IPaymentLinkStatusGroup, IStore } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { StoreIds } from '../types';
import type { PaymentLinkTableCols } from './fields';

export type StoreData = IStore & { name?: string; id?: string };

export type PaymentLinkTableFields = StringWithAutocompleteOptions<PaymentLinkTableCols>;

export type PaymentLinksOverviewModalType = 'Creation' | 'Settings';

export interface PaymentLinksOverviewFilters {
    statusGroup: IPaymentLinkStatusGroup;
    statuses: string[];
    linkTypes: string[];
    storeIds: string[];
    merchantReference?: string;
    paymentLinkId?: string;
    createdSince: string;
    createdUntil: string;
}

export interface PaymentLinksOverviewProps extends PaginationProps {
    storeIds?: StoreIds;
    onRecordSelection?: (selection: { id: string; showDetails: () => void }) => void;
}

export type { IStore };
