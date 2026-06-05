import type { CoreInstance } from '@integration-components/core/vue';
import type { TransactionDetailsCustomization } from '@integration-components/transactions/domain';

export interface TransactionDetailsExternalProps {
    core: CoreInstance;
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    hideTitle?: boolean;
}
