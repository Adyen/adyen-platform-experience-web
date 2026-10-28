import { PaymentLinkSettings as PaymentLinkSettingsAdyen, type PaymentLinkSettingsProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import { appearanceSection, contactSupportControl, dismissControl, toContactSupport, toDismiss, toVisibility } from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { storeIdsControl, toStoreIds } from './controls';

const SECTIONS: readonly ControlSection[] = [
    {
        title: 'Props',
        controls: [
            {
                ...storeIdsControl,
                remount: true,
                hint: 'Comma-separated store IDs to choose from. Only read on setup, so changing it remounts the component.',
            },
        ],
    },
    {
        title: 'Callbacks',
        controls: [
            { ...dismissControl, hint: 'Adds a "Go back" action next to "Save".' },
            { ...contactSupportControl, hint: 'Adds a "Contact support" action to error states.' },
        ],
    },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<PaymentLinkSettingsProps> => ({
    storeIds: toStoreIds(values),
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    appearance: toVisibility(values),
});

export const PaymentLinkSettings = () => (
    <ComponentPlayground title="PaymentLinkSettings" element={PaymentLinkSettingsAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
