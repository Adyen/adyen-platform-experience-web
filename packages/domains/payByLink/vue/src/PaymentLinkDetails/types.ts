import type { UIElementProps } from '@integration-components/core/vue';
import type { PaymentLinkDetailsProps, PayByLinkTranslationKey } from '../../../domain/src';

export type { PaymentLinkActivityStatus, PaymentLinkDetailsScreen, PaymentLinkListItems, PaymentLinkStatusTagVariant } from '../../../domain/src';

export type PaymentLinkDetailsExternalProps = UIElementProps & PaymentLinkDetailsProps;

export type PaymentLinkDetailsComponentProps = Omit<PaymentLinkDetailsExternalProps, 'core' | 'appearance'> & {
    onTitleChange?: (title: PayByLinkTranslationKey | undefined) => void;
    onUpdate?: () => void;
};
