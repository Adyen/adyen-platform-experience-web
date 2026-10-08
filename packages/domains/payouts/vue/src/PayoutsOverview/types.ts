import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, IBalanceAccountBase, WithDataGridAppearance } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { PayoutDetailsCustomization, PayoutsListCustomization } from '@integration-components/payouts/domain';

export type PayoutsOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

// ── Component prop types ──

export interface PayoutsOverviewExternalProps extends UIElementProps, PaginationProps {
    appearance?: PayoutsOverviewAppearance;
    balanceAccountId?: string;
    onContactSupport?: () => void;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
        list?: PayoutsListCustomization;
    };
}

export type { IBalanceAccountBase };
