import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, IBalanceAccountBase, IReport, WithDataGridAppearance } from '@integration-components/types';
import type { ReportsOverviewProps } from '../../../domain/src';

export type ReportsOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

// ── Component prop types ──
export type ReportsOverviewExternalProps = UIElementProps<ReportsOverviewAppearance> & ReportsOverviewProps;
export type ReportsOverviewComponentProps = Omit<ReportsOverviewExternalProps, 'core' | 'appearance'>;

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
