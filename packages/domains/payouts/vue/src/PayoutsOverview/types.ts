import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { PayoutDetailsCustomization, PayoutsDataGridCustomization } from '@integration-components/payouts/domain';

export type { IBalanceAccountBase } from '@integration-components/types';
export type PayoutsOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

// ── Component prop types ──

export interface PayoutsOverviewExternalProps extends UIElementProps<PayoutsOverviewAppearance>, PaginationProps {
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showDetails: () => void }) => any;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
        dataGrid?: PayoutsDataGridCustomization;
    };
}
