import type { CoreInstance } from '@integration-components/core/vue';
import type { PayoutDetailsProps } from '../../../domain/src';

export type { PayoutDetailsCustomization } from '../../../domain/src';

export interface PayoutDetailsExternalProps extends Omit<PayoutDetailsProps, 'ref'> {
    core: CoreInstance;
}
