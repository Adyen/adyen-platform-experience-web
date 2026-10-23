import type { CoreInstance } from '@integration-components/core/vue';
import type { ICashOutResponse, UIElementProps } from '@integration-components/types';

export type CashOutOverviewExternalProps = Omit<UIElementProps, 'ref'> & {
    core: CoreInstance;
    /** Called with the cashOut once it is instructed from the CashOut Overview, so the integration can track it by its id. */
    onCashOutInstructed?: (cashOut: ICashOutResponse) => void;
};

export type CashOutOverviewProps = Omit<CashOutOverviewExternalProps, 'core'>;
