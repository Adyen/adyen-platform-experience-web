import type { UIElementProps } from '@integration-components/core/vue';
import type { PayoutDetailsProps } from '../../../domain/src';

export type { PayoutDetailsCustomization } from '../../../domain/src';

export type PayoutDetailsExternalProps = UIElementProps & PayoutDetailsProps;
export type PayoutDetailsComponentProps = Omit<PayoutDetailsExternalProps, 'core' | 'appearance'>;
