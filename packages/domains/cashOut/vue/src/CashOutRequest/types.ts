import type { CoreInstance } from '@integration-components/core/vue';
import type { ICashOutEligibility, UIElementProps } from '@integration-components/types';

// The standalone component doesn't offer contact support.
export type CashOutRequestExternalProps = Omit<UIElementProps, 'ref' | 'onContactSupport'> & {
    core: CoreInstance;
};

export type CashOutRequestProps = Omit<CashOutRequestExternalProps, 'core'> & {
    /** The balance account selected initially. */
    balanceAccountId?: string;
    /** The eligibility of `balanceAccountId`, already loaded by the component that opens this one. */
    eligibility?: ICashOutEligibility;
    hideTitle?: boolean;
    /** Passed on by the CashOut Overview when it opens this component in its modal. */
    onContactSupport?: () => void;
};
