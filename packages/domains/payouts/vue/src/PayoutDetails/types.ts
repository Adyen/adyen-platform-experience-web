import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PayoutDetailsProps } from '../../../domain/src';

export type { PayoutDetailsCustomization } from '../../../domain/src';

export type PayoutDetailsAppearance = GlobalAppearance & WithDataGridAppearance;

export type PayoutDetailsExternalProps = Omit<PayoutDetailsProps, 'ref'> & UIElementProps & { appearance?: PayoutDetailsAppearance };
