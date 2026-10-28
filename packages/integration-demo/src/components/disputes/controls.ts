import type { DisputeDetailsCustomization, DisputesDataGridCustomization, DisputesOverviewTabsConfig } from '@adyen/adyen-platform-experience-web';
import { compact, createPaginationSection, isOn, toList, type Presets } from '../../playground/controls';
import { customButton, customFlag, customLink, getProduct, getStore } from '../../playground/customData';
import { logEvent } from '../../playground/events';
import type { ChoiceControl, ControlValues, ToggleControl } from '../../playground/types';

type DisputeStatusGroup = NonNullable<DisputesOverviewTabsConfig['hidden']>[number];
type DisputeCallbackData = { id: string };

export const disputesPaginationSection = createPaginationSection([10, 20], 30);

export const tabsHiddenControl: ChoiceControl = {
    key: 'tabsHidden',
    label: 'tabs.hidden',
    type: 'checkboxes',
    options: (['CHARGEBACKS', 'FRAUD_ALERTS', 'ONGOING_AND_CLOSED'] satisfies DisputeStatusGroup[]).map(group => ({ label: group, value: group })),
    hint: 'Hidden tabs are removed from the overview. Hiding every tab is ignored.',
};

export const toTabs = (values: ControlValues): DisputesOverviewTabsConfig | undefined => {
    const hidden = toList<DisputeStatusGroup>(values.tabsHidden);
    return compact({ hidden: hidden.length > 0 ? hidden : undefined });
};

const logAccept = (dispute: DisputeCallbackData) => logEvent('onAccept()', dispute);
const logDefend = (dispute: DisputeCallbackData) => logEvent('onDefend()', dispute);

export const acceptControl: ToggleControl = {
    key: 'onAccept',
    label: 'onAccept',
    type: 'toggle',
    hint: 'Called with the dispute ID after the dispute is accepted.',
};

export const defendControl: ToggleControl = {
    key: 'onDefend',
    label: 'onDefend',
    type: 'toggle',
    hint: 'Called with the dispute ID after the dispute is defended.',
};

export const toAccept = (values: ControlValues) => (isOn(values.onAccept) ? logAccept : undefined);

export const toDefend = (values: ControlValues) => (isOn(values.onDefend) ? logDefend : undefined);

export const DISPUTES_DATA_GRID_PRESETS: Presets<DisputesDataGridCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide paymentMethod and disputeReason',
        value: {
            fields: [
                { key: 'paymentMethod', visibility: 'hidden' },
                { key: 'disputeReason', visibility: 'hidden' },
            ],
        },
    },
    custom: {
        label: 'Custom columns (onDataRetrieve)',
        value: {
            fields: [{ key: 'disputeReason', visibility: 'hidden' }, { key: '_store', flex: 1.2 }, { key: '_summary' }, { key: '_action' }],
            onDataRetrieve: async disputes =>
                disputes.map(dispute => ({
                    ...dispute,
                    _store: getStore(dispute.disputePspReference),
                    _summary: customLink('Summary'),
                    _action: customButton('Send email', { id: dispute.disputePspReference }),
                })),
        },
    },
};

export const DISPUTE_DETAILS_PRESETS: Presets<DisputeDetailsCustomization> = {
    '': { label: 'None' },
    hidden: {
        label: 'Hide id and balanceAccount',
        value: {
            fields: [
                { key: 'id', visibility: 'hidden' },
                { key: 'balanceAccount', visibility: 'hidden' },
            ],
        },
    },
    custom: {
        label: 'Custom fields (onDataRetrieve)',
        value: {
            fields: [{ key: '_store' }, { key: '_product' }, { key: '_country' }, { key: '_summary' }, { key: '_action' }],
            onDataRetrieve: async detail => {
                const id = detail.dispute.pspReference;
                return {
                    ...detail,
                    _store: getStore(id),
                    _product: getProduct(id),
                    _country: customFlag(id),
                    _summary: customLink('See summary'),
                    _action: customButton('Send email', { id }),
                };
            },
        },
    },
};
