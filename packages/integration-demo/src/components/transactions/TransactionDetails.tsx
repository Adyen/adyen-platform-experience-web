import { TransactionDetails as TransactionDetailsAdyen, type TransactionDetailsProps } from '@adyen/adyen-platform-experience-web';
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
import { TRANSACTION_DETAILS_PRESETS } from './presets';

const SECTIONS: readonly ControlSection[] = [
    {
        title: 'Props',
        controls: [
            {
                key: 'id',
                label: 'id',
                type: 'text',
                defaultValue: 'EVJN4294K223224K5Q75G622SF6RBDEUR',
                hint: 'Transaction ID. An unknown ID shows the error state.',
            },
        ],
    },
    { title: 'Callbacks', controls: [dismissControl, contactSupportControl] },
    { title: 'dataCustomization', controls: [presetControl('details', 'dataCustomization.details', TRANSACTION_DETAILS_PRESETS)] },
    appearanceSection({ dataGrid: false }),
];

const toProps = (values: ControlValues): ElementProps<TransactionDetailsProps> => ({
    id: values.id ?? '',
    onDismiss: toDismiss(values),
    onContactSupport: toContactSupport(values),
    dataCustomization: compact({ details: TRANSACTION_DETAILS_PRESETS[values.details]?.value }),
    appearance: toVisibility(values),
});

export const TransactionDetails = () => (
    <ComponentPlayground title="TransactionDetails" element={TransactionDetailsAdyen} sections={SECTIONS} toProps={toProps} narrow />
);
