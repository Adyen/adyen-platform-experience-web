import type { UIElementProps } from '@integration-components/core/vue';
import type { PayoutDetailsProps } from '../../../domain/src';

export type { PayoutDetailsCustomization } from '../../../domain/src';

export type PayoutDetailsExternalProps = Omit<PayoutDetailsProps, 'ref'> & UIElementProps;
