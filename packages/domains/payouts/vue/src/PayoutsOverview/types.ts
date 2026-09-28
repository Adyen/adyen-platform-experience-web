import type { UIElementProps } from '@integration-components/core/vue';
import type { DataGridComponentAppearance, IBalanceAccountBase } from '@integration-components/types';
import type { PayoutDetailsCustomization, PayoutsListCustomization } from '@integration-components/payouts/domain';

// ── Component prop types ──

export interface PayoutsOverviewExternalProps extends UIElementProps {
    appearance?: DataGridComponentAppearance;
    balanceAccountId?: string;
    allowLimitSelection?: boolean;
    preferredLimit?: number;
    hideTitle?: boolean;
    showDetails?: boolean;
    onContactSupport?: () => void;
    onFiltersChanged?: (filters: Record<string, string | undefined>) => any;
    onRecordSelection?: (selection: { balanceAccountId: string; date: string; showModal: () => void }) => any;
    dataCustomization?: {
        details?: PayoutDetailsCustomization;
        list?: PayoutsListCustomization;
    };
}

export type { IBalanceAccountBase };
