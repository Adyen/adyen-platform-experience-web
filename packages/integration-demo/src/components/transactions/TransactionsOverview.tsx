import { TransactionsOverview as TransactionsOverviewAdyen, type TransactionsOverviewProps } from '@adyen/adyen-platform-experience-web';
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
import { TRANSACTION_DETAILS_PRESETS, TRANSACTIONS_DATA_GRID_PRESETS } from './presets';

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [balanceAccountIdControl] },
    { title: 'Callbacks', controls: [recordSelectionControl, contactSupportControl] },
    paginationSection,
    {
        title: 'dataCustomization',
        controls: [
            presetControl('dataGrid', 'dataCustomization.dataGrid', TRANSACTIONS_DATA_GRID_PRESETS),
            presetControl('details', 'dataCustomization.details', TRANSACTION_DETAILS_PRESETS),
        ],
    },
    appearanceSection({ dataGrid: true }),
];

const toProps = (values: ControlValues): ElementProps<TransactionsOverviewProps> => ({
    balanceAccountId: optional(values.balanceAccountId),
    onRecordSelection: toRecordSelection(values),
    onContactSupport: toContactSupport(values),
    pagination: toPagination(values),
    dataCustomization: compact({
        dataGrid: TRANSACTIONS_DATA_GRID_PRESETS[values.dataGrid]?.value,
        details: TRANSACTION_DETAILS_PRESETS[values.details]?.value,
    }),
    appearance: toAppearance(values),
});

export const TransactionsOverview = () => (
    <ComponentPlayground title="TransactionsOverview" element={TransactionsOverviewAdyen} sections={SECTIONS} toProps={toProps} />
);
