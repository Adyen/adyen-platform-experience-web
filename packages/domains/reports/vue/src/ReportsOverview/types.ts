import type { CoreInstance } from '@integration-components/core/vue';
import type { IBalanceAccountBase, IReport } from '@integration-components/types';

export interface CustomDataObject {
    type?: 'text' | 'link' | 'icon' | 'button';
    value: any;
    config?: Record<string, any>;
}

export type CustomDataRetrieved = Record<string, CustomDataObject | Record<string, any> | string | number | boolean>;

export interface DataCustomizationList<Fields extends string> {
    fields?: { key: Fields; flex?: number; align?: 'right' | 'left' | 'center'; visibility?: 'visible' | 'hidden' }[];
    onDataRetrieve?: (data: IReport[]) => Promise<CustomDataRetrieved[]> | CustomDataRetrieved[];
}

// ── Component prop types ──

export interface ReportsOverviewExternalProps {
    core: CoreInstance;
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    dataCustomization?: {
        list?: DataCustomizationList<string>;
    };
}

export type { IBalanceAccountBase };

/**
 * Shape of the /v1/reports list response as consumed by useReportsList.
 * Mirrors `components['schemas']['ReportsListResponseDTO']` but kept local
 * to avoid pulling the OpenAPI alias across the boundary.
 */
export interface ReportsListResponse {
    data?: IReport[];
    _links?: {
        next?: { cursor: string };
        prev?: { cursor: string };
    };
}
