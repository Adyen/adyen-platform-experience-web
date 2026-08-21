import type { CoreInstance } from '@integration-components/core/vue';
import type { DisputeManagementProps } from '../../../domain/src';

export type {
    DisputeCallbackData,
    DisputeDetailsCustomization,
    DisputeDetailsFields,
    DisputeManagementComponentProps,
    DisputeManagementProps,
} from '../../../domain/src';

export interface DisputeManagementExternalProps extends Omit<DisputeManagementProps, 'ref'> {
    core: CoreInstance;
}

export type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';

export interface SelectDropdownItem {
    id: string;
    name: string;
    disabled?: boolean;
}
