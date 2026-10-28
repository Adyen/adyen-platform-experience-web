import { ReportsOverview as ReportsOverviewAdyen, type ReportsOverviewProps } from '@adyen/adyen-platform-experience-web';
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
    toAppearance,
    toContactSupport,
    toPagination,
} from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { REPORTS_DATA_GRID_PRESETS } from './presets';

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [balanceAccountIdControl] },
    { title: 'Callbacks', controls: [contactSupportControl] },
    paginationSection,
    { title: 'dataCustomization', controls: [presetControl('dataGrid', 'dataCustomization.dataGrid', REPORTS_DATA_GRID_PRESETS)] },
    appearanceSection({ dataGrid: true }),
];

const toProps = (values: ControlValues): ElementProps<ReportsOverviewProps> => ({
    balanceAccountId: optional(values.balanceAccountId),
    onContactSupport: toContactSupport(values),
    pagination: toPagination(values),
    dataCustomization: compact({ dataGrid: REPORTS_DATA_GRID_PRESETS[values.dataGrid]?.value }),
    appearance: toAppearance(values),
});

export const ReportsOverview = () => (
    <ComponentPlayground title="ReportsOverview" element={ReportsOverviewAdyen} sections={SECTIONS} toProps={toProps} />
);
