import { PaymentLinksOverview as PaymentLinksOverviewAdyen, type PaymentLinksOverviewProps } from '@adyen/adyen-platform-experience-web';
import type { ElementProps } from '../../hooks/useAdyenElement';
import { ComponentPlayground } from '../../playground/ComponentPlayground';
import {
    appearanceSection,
    contactSupportControl,
    paginationSection,
    recordSelectionControl,
    toAppearance,
    toContactSupport,
    toPagination,
    toRecordSelection,
} from '../../playground/controls';
import type { ControlSection, ControlValues } from '../../playground/types';
import { storeIdsControl, toStoreIds } from './controls';

const SECTIONS: readonly ControlSection[] = [
    { title: 'Props', controls: [storeIdsControl] },
    {
        title: 'Callbacks',
        controls: [recordSelectionControl, { ...contactSupportControl, hint: 'Adds a "Contact support" action to error states.' }],
    },
    paginationSection,
    appearanceSection({ dataGrid: true }),
];

const toProps = (values: ControlValues): ElementProps<PaymentLinksOverviewProps> => ({
    storeIds: toStoreIds(values),
    onRecordSelection: toRecordSelection(values),
    onContactSupport: toContactSupport(values),
    pagination: toPagination(values),
    appearance: toAppearance(values),
});

export const PaymentLinksOverview = () => (
    <ComponentPlayground title="PaymentLinksOverview" element={PaymentLinksOverviewAdyen} sections={SECTIONS} toProps={toProps} />
);
