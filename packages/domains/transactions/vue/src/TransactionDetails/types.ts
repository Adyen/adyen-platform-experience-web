import type { CoreInstance } from '@integration-components/core/vue';
import type { TransactionDetailsCustomization } from '../../../domain/src';

export interface TransactionDetailsExternalProps {
    core: CoreInstance;
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    hideTitle?: boolean;
}
