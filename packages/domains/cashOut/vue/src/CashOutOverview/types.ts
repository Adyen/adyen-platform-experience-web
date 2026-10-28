import type { CoreInstance } from '@integration-components/core/vue';
import type { UIElementProps } from '@integration-components/types';
import type { CashOutIntegrationProps } from '../shared/types';

// Errors go to the onError set on Core, as the component has no onError of its own.
export type CashOutOverviewExternalProps = Omit<UIElementProps, 'ref' | 'onError'> &
    CashOutIntegrationProps & {
        core: CoreInstance;
    };

export type CashOutOverviewProps = Omit<CashOutOverviewExternalProps, 'core'>;
