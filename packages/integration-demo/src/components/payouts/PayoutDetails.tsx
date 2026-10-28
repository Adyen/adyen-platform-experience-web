import { PayoutDetails as PayoutDetailsAdyen, type PayoutDetailsProps } from '@adyen/adyen-platform-experience-web';
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
import { PAYOUT_DETAILS_PRESETS } from './presets';

const SECTIONS: readonly ControlSection[] = [
    {
        title: 'Props',
        controls: [
            {
                key: 'id',
                label: 'id',
                type: 'text',
                defaultValue: 'BA32CNP223227N5KZ2NDW77PR',
                hint: 'Balance account ID of the payout. An unknown ID shows the error state.',
            },
            {
                key: 'date',
                label: 'date',
                type: 'text',
                defaultValue: '2026-10-06T00:00:00.000+00:00',
                hint: 'Payout date (ISO 8601).',
            },
        ],
    },
    { title: 'Callbacks', controls: [dismissControl, contactSupportControl] },
    { title: 'dataCustomization', controls: [presetControl('details', 'dataCustomization.details', PAYOUT_DETAILS_PRESETS)] },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<PayoutDetailsProps> => ({
    id: values.id ?? '',
    date: values.date ?? '',
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    dataCustomization: compact({ details: PAYOUT_DETAILS_PRESETS[values.details]?.value }),
    appearance: toVisibility(values),
});

export const PayoutDetails = () => (
    <ComponentPlayground title="PayoutDetails" element={PayoutDetailsAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
