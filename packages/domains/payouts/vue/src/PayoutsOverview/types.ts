import type { UIElementProps } from '@integration-components/core/vue';
import type { IBalanceAccountBase } from '@integration-components/types';
import type { PaginationProps } from '@integration-components/utils';
import type { PayoutDetailsCustomization, PayoutsListCustomization } from '@integration-components/payouts/domain';

// ── Component prop types ──

export interface PayoutsOverviewExternalProps extends UIElementProps, PaginationProps {
    balanceAccountId?: string;
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
