import { PayoutsOverview as PayoutsOverviewAdyen, type PayoutsOverviewProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import {
    appearanceSection,
    balanceAccountIdControl,
    compact,
    contactSupportControl,
    optional,
    paginationSection,
    presetControl,
    recordSelectionControl,
    toAppearance,
    toContactSupport,
    toPagination,
    toRecordSelection,
} from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { PAYOUT_DETAILS_PRESETS, PAYOUTS_DATA_GRID_PRESETS } from './presets';

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [balanceAccountIdControl] },
    { title: 'Callbacks', controls: [recordSelectionControl, contactSupportControl] },
    paginationSection,
    {
        title: 'dataCustomization',
        controls: [
            presetControl('dataGrid', 'dataCustomization.dataGrid', PAYOUTS_DATA_GRID_PRESETS),
            presetControl('details', 'dataCustomization.details', PAYOUT_DETAILS_PRESETS),
        ],
    },
    appearanceSection({ dataGrid: true }),
];

const toProps = (values: ControlValues): ElementProps<PayoutsOverviewProps> => ({
    balanceAccountId: optional(values.balanceAccountId),
    onRecordSelection: toRecordSelection(values),
    onContactSupport: toContactSupport(values),
    pagination: toPagination(values),
    dataCustomization: compact({
        dataGrid: PAYOUTS_DATA_GRID_PRESETS[values.dataGrid]?.value,
        details: PAYOUT_DETAILS_PRESETS[values.details]?.value,
    }),
    appearance: toAppearance(values),
});

export const PayoutsOverview = () => (
    <ComponentPlayground title="PayoutsOverview" element={PayoutsOverviewAdyen} sections={SECTIONS} toProps={toProps} />
);
