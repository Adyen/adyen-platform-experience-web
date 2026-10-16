import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance } from '@integration-components/types';
import type { PaymentLinksOverviewProps } from '../../../domain/src';

export type PaymentLinksOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export type PaymentLinksOverviewExternalProps = UIElementProps<PaymentLinksOverviewAppearance> & PaymentLinksOverviewProps;
export type PaymentLinksOverviewComponentProps = Omit<PaymentLinksOverviewExternalProps, 'core' | 'appearance'>;
