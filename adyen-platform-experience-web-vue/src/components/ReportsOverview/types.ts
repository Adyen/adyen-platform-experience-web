import type { CoreInstance } from '../../core/types';
import { IBalanceAccountBase } from '../../types';
import type { IReport } from '../../types';

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
