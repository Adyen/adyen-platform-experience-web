import type { CoreInstance } from '@integration-components/core/vue';
import type { PaymentLinksOverviewProps } from '../../../domain/src';

export interface PaymentLinksOverviewExternalProps extends PaymentLinksOverviewProps {
    core: CoreInstance;
}
