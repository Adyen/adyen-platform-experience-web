export type {
    DisputeCallbackData,
    DisputeDetailsCustomization,
    DisputeDetailsFields,
    DisputeManagementComponentProps,
    DisputeManagementProps,
} from '../../../domain/src';

export type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';

export interface SelectDropdownItem {
    id: string;
    name: string;
    disabled?: boolean;
}
