import type { UIElementProps } from '@integration-components/core/vue';
import type { DisputeManagementProps } from '../../../domain/src';

export type {
    DisputeCallbackData,
    DisputeDetailsCustomization,
    DisputeDetailsFields,
    DisputeManagementComponentProps,
    DisputeManagementProps,
} from '../../../domain/src';

export type DisputeManagementExternalProps = Omit<DisputeManagementProps, 'ref'> & UIElementProps;

export type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';

export interface SelectDropdownItem {
    id: string;
    name: string;
    disabled?: boolean;
}
