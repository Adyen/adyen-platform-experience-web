import type { UIElementProps } from '@integration-components/core/vue';
import type { CashOutOverviewProps } from '@integration-components/cashOut/domain';

// Errors go to the onError set on Core.
export type CashOutOverviewExternalProps = UIElementProps & CashOutOverviewProps;
export type CashOutOverviewComponentProps = Omit<CashOutOverviewExternalProps, 'core' | 'appearance'>;
