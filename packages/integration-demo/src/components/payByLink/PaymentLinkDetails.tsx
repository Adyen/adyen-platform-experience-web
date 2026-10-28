import { PaymentLinkDetails as PaymentLinkDetailsAdyen, type PaymentLinkDetailsProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import { appearanceSection, contactSupportControl, dismissControl, toContactSupport, toDismiss, toVisibility } from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';

const SECTIONS: readonly ControlSection[] = [
    {
        title: 'Props',
        controls: [
            {
                key: 'id',
                label: 'id',
                type: 'text',
                defaultValue: 'PL14287AE85761D26F10F6276',
                hint: 'Payment link ID. An unknown ID shows the error state.',
            },
        ],
    },
    {
        title: 'Callbacks',
        controls: [dismissControl, { ...contactSupportControl, hint: 'Adds a "Contact support" action to server errors.' }],
    },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<PaymentLinkDetailsProps> => ({
    id: values.id ?? '',
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    appearance: toVisibility(values),
});

export const PaymentLinkDetails = () => (
    <ComponentPlayground title="PaymentLinkDetails" element={PaymentLinkDetailsAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
