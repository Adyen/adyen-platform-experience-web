import type { ReportsOverviewProps } from '../../../domain/src';
import type { UIElementProps } from '@integration-components/core/vue';
import type { CustomColumn, IBalanceAccountBase, IReport, OnDataRetrievedCallback } from '@integration-components/types';
import type { StringWithAutocompleteOptions } from '@integration-components/utils/types';

export interface DataCustomizationList<Fields extends string> {
    fields?: CustomColumn<StringWithAutocompleteOptions<Fields>>[];
    onDataRetrieve?: OnDataRetrievedCallback<IReport[]>;
}

// ── Component prop types ──
export type ReportsOverviewExternalProps = Omit<ReportsOverviewProps, 'ref'> & UIElementProps;

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
