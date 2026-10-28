import { DisputeManagement as DisputeManagementAdyen, type DisputeManagementProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import {
    appearanceSection,
    compact,
    contactSupportControl,
    dismissControl,
    presetControl,
    toContactSupport,
    toDismiss,
    toVisibility,
} from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { acceptControl, defendControl, DISPUTE_DETAILS_PRESETS, toAccept, toDefend } from './controls';

const SECTIONS: readonly ControlSection[] = [
    {
        title: 'Props',
        controls: [
            {
                key: 'id',
                label: 'id',
                type: 'text',
                defaultValue: 'RX8VWGR5HTX9MH75',
                hint: 'Dispute PSP reference. An unknown ID shows the error state.',
            },
        ],
    },
    {
        title: 'Callbacks',
        controls: [
            acceptControl,
            defendControl,
            dismissControl,
            {
                ...contactSupportControl,
                hint: 'Adds a "Contact support" action to error states, fraud notifications, and disputes that can only be handled outside the component.',
            },
        ],
    },
    { title: 'dataCustomization', controls: [presetControl('details', 'dataCustomization.details', DISPUTE_DETAILS_PRESETS)] },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<DisputeManagementProps> => ({
    id: values.id ?? '',
    onAccept: toAccept(values),
    onDefend: toDefend(values),
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    dataCustomization: compact({ details: DISPUTE_DETAILS_PRESETS[values.details]?.value }),
    appearance: toVisibility(values),
});

export const DisputeManagement = () => (
    <ComponentPlayground title="DisputeManagement" element={DisputeManagementAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
