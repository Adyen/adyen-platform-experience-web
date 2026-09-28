import type { UIElementProps } from '@integration-components/core/vue';
import type { DataGridComponentAppearance } from '@integration-components/types';
import type { PaymentLinksOverviewProps } from '../../../domain/src';

export type PaymentLinksOverviewExternalProps = PaymentLinksOverviewProps & UIElementProps & { appearance?: DataGridComponentAppearance };
