import type { CoreInstance } from '@integration-components/core/vue';
import type { CustomColumn, IBalanceAccountBase, IPayout, OnDataRetrievedCallback, CustomDataRetrieved } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';
import type { PayoutsTableFields } from './constants';

export interface DataCustomizationList<Fields extends string> {
    fields?: CustomColumn<StringWithAutocompleteOptions<Fields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IPayout[], CustomDataRetrieved[]>;
}

// ── Component prop types ──

export interface PayoutsOverviewExternalProps {
    core: CoreInstance;
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;
    dataCustomization?: {
        list?: DataCustomizationList<PayoutsTableFields>;
    };
}

export type { IBalanceAccountBase };

/**
 * Shape of the /v1/payouts list response as consumed by usePayoutsList.
 * Mirrors the OpenAPI alias but kept local to avoid pulling generated types
 * across the Vue domain boundary.
 */
export interface PayoutsListResponse {
    data?: IPayout[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}
