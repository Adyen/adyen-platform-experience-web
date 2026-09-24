import type { UIElementProps } from '@integration-components/core/vue';
import type { TransactionDetailsCustomization } from '../../../domain/src';

export interface TransactionDetailsExternalProps extends UIElementProps {
    id: string;
    dataCustomization?: { details?: TransactionDetailsCustomization };
    onContactSupport?: () => void;
    hideTitle?: boolean;
}
