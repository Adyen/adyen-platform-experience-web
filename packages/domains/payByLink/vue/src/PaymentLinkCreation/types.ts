import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkCreationProps } from '../../../domain/src';

export interface PaymentLinkCreationExternalProps extends PaymentLinkCreationProps {
    core: CoreInstance;
}
