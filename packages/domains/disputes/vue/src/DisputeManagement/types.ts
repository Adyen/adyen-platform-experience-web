import type { CoreInstance } from '@integration-components/core/vue';
import type { DisputeManagementProps } from '../../../domain/src';

export type {
    DisputeCallbackData,
    DisputeDetailsCustomization,
    DisputeDetailsFields,
    DisputeManagementComponentProps,
    DisputeManagementProps,
} from '../../../domain/src';

export interface DisputeManagementExternalProps extends DisputeManagementProps {
    core: CoreInstance;
}

export type DisputeDataAlertMode = 'contactSupport' | 'autoDefended' | 'notDefended' | 'notDefendable';
