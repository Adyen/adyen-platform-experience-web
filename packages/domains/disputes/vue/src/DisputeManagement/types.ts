import type { UIElementProps } from '@integration-components/core/vue';
import type { DisputeManagementProps } from '../../../domain/src';

export type { DisputeCallbackData, DisputeDetailsCustomization, DisputeDetailsFields } from '../../../domain/src';
export type DisputeManagementExternalProps = UIElementProps & DisputeManagementProps;
export type DisputeManagementComponentProps = Omit<DisputeManagementExternalProps, 'core' | 'appearance'>;

export type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';

export interface SelectDropdownItem {
    id: string;
    name: string;
    disabled?: boolean;
}
