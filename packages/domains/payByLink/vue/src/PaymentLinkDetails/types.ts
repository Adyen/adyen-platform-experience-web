import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinkDetailsProps } from '../../../domain/src';

export type { PaymentLinkDetailsComponentProps, PaymentLinkDetailsProps } from '../../../domain/src';

export interface PaymentLinkDetailsExternalProps extends PaymentLinkDetailsProps {
    core: CoreInstance;
}
