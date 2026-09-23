import type { ComponentAppearance } from '@integration-components/types';
import type { UIElementProps } from '@integration-components/core/vue';
import type { PaymentLinksOverviewProps } from '../../../domain/src';

export type PaymentLinksOverviewAppearance = ComponentAppearance<'dataGrid'>;

export type PaymentLinksOverviewExternalProps = PaymentLinksOverviewProps & UIElementProps<'dataGrid'>;
