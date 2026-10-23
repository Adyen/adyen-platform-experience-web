import type { CoreInstance } from '@integration-components/core/vue';
import type { ICashOutEligibility, UIElementProps } from '@integration-components/types';

export type CashOutRequestExternalProps = Omit<UIElementProps, 'ref'> & {
    core: CoreInstance;
};

export type CashOutRequestProps = Omit<CashOutRequestExternalProps, 'core'> & {
    /** The balance account selected initially. */
    balanceAccountId?: string;
    /** The eligibility of `balanceAccountId`, already loaded by the component that opens this one. */
    eligibility?: ICashOutEligibility;
    hideTitle?: boolean;
};
