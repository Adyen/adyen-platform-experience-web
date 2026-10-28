import { PaymentLinkCreation as PaymentLinkCreationAdyen, type PaymentLinkCreationProps } from '@adyen/adyen-platform-experience-web';
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
import { createControl, FIELDS_DATA_PRESETS, FIELDS_VISIBILITY_PRESETS, storeIdsControl, toCreate, toStoreIds } from './controls';

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [storeIdsControl] },
    {
        title: 'Callbacks',
        controls: [
            createControl,
            { ...dismissControl, hint: 'Adds a "Go back" action to the first step.' },
            { ...contactSupportControl, hint: 'Adds a "Contact support" action to error states.' },
        ],
    },
    {
        title: 'fieldsConfig',
        controls: [
            {
                ...presetControl('fieldsData', 'fieldsConfig.data', FIELDS_DATA_PRESETS),
                remount: true,
                hint: 'Prefills the form. Only read on setup, so changing it remounts the component.',
            },
            {
                ...presetControl('fieldsVisibility', 'fieldsConfig.visibility', FIELDS_VISIBILITY_PRESETS),
                hint: 'Combine with fieldsConfig.data to lock or hide prefilled values.',
            },
        ],
    },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<PaymentLinkCreationProps> => ({
    storeIds: toStoreIds(values),
    onCreate: toCreate(values),
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    fieldsConfig: compact({
        data: FIELDS_DATA_PRESETS[values.fieldsData]?.value,
        visibility: FIELDS_VISIBILITY_PRESETS[values.fieldsVisibility]?.value,
    }),
    appearance: toVisibility(values),
});

export const PaymentLinkCreation = () => (
    <ComponentPlayground title="PaymentLinkCreation" element={PaymentLinkCreationAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
