import type { CoreInstance } from '@integration-components/core/vue';
import type { UIElementProps } from '@integration-components/types';

export type CashOutOverviewExternalProps = Omit<UIElementProps, 'ref'> & {
    core: CoreInstance;
};

export type CashOutOverviewProps = Omit<CashOutOverviewExternalProps, 'core'>;
