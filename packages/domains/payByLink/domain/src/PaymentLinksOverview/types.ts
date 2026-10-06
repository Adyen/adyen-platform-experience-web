import type { IPaymentLinkStatusGroup, IStore } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { PaymentLinkCreationFieldsConfig, PaymentLinkCreationFormValues } from '../PaymentLinkCreation';
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

export interface PaymentLinksOverviewProps {
    allowLimitSelection?: boolean;
    balanceAccountId?: string;
    preferredLimit?: 10 | 20;
    storeIds?: StoreIds;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { id: string; showModal: () => void }) => void;
    paymentLinkCreation?: {
        onPaymentLinkCreated?: (paymentLink: PaymentLinkCreationFormValues) => void;
        onDismiss?: () => void;
        fieldsConfig?: PaymentLinkCreationFieldsConfig;
    };
    paymentLinkSettings?: {
        onDismiss: () => void;
    };
}

export type { IStore };
