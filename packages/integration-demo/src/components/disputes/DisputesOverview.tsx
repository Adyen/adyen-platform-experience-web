import { DisputesOverview as DisputesOverviewAdyen, type DisputesOverviewProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import {
    appearanceSection,
    balanceAccountIdControl,
    compact,
    contactSupportControl,
    optional,
    presetControl,
    recordSelectionControl,
    toAppearance,
    toContactSupport,
    toPagination,
    toRecordSelection,
} from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { DISPUTE_DETAILS_PRESETS, DISPUTES_DATA_GRID_PRESETS, disputesPaginationSection, tabsHiddenControl, toTabs } from './controls';

type DisputesPageLimit = NonNullable<NonNullable<DisputesOverviewProps['pagination']>['defaultLimit']>;

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [balanceAccountIdControl] },
    { title: 'Callbacks', controls: [recordSelectionControl, contactSupportControl] },
    { title: 'tabs', controls: [tabsHiddenControl] },
    disputesPaginationSection,
    {
        title: 'dataCustomization',
        controls: [
            presetControl('dataGrid', 'dataCustomization.dataGrid', DISPUTES_DATA_GRID_PRESETS),
            presetControl('details', 'dataCustomization.details', DISPUTE_DETAILS_PRESETS),
        ],
    },
    appearanceSection({ dataGrid: true }),
];

const toProps = (values: ControlValues): ElementProps<DisputesOverviewProps> => ({
    balanceAccountId: optional(values.balanceAccountId),
    onRecordSelection: toRecordSelection(values),
    onContactSupport: toContactSupport(values),
    tabs: toTabs(values),
    pagination: toPagination<DisputesPageLimit>(values),
    dataCustomization: compact({
        dataGrid: DISPUTES_DATA_GRID_PRESETS[values.dataGrid]?.value,
        details: DISPUTE_DETAILS_PRESETS[values.details]?.value,
    }),
    appearance: toAppearance(values),
});

export const DisputesOverview = () => (
    <ComponentPlayground title="DisputesOverview" element={DisputesOverviewAdyen} sections={SECTIONS} toProps={toProps} />
);
