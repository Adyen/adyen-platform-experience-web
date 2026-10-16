import type { UIElementProps } from '@integration-components/core/vue';
import type { GlobalAppearance, WithDataGridAppearance, WithDismissCallback } from '@integration-components/types';
import type { PaymentLinkCreationFieldsConfig, PaymentLinkCreationFormValues, PaymentLinksOverviewProps } from '../../../domain/src';

export type PaymentLinksOverviewAppearance = GlobalAppearance & WithDataGridAppearance;

export type PaymentLinksOverviewExternalProps = UIElementProps<PaymentLinksOverviewAppearance> & PaymentLinksOverviewProps;

export type PaymentLinksOverviewComponentProps = Omit<PaymentLinksOverviewExternalProps, 'core' | 'appearance'> & {
    paymentLinkCreation?: WithDismissCallback & {
        onCreate?: (paymentLink: PaymentLinkCreationFormValues) => void;
        fieldsConfig?: PaymentLinkCreationFieldsConfig;
    };
    paymentLinkSettings?: WithDismissCallback;
};
