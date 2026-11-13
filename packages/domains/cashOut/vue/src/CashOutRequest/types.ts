import type { UIElementProps } from '@integration-components/core/vue';
import type { CashOutRequestProps } from '@integration-components/cashOut/domain';
import type { ICashOutEligibility, ICashOutResponse } from '@integration-components/types';

// The standalone component doesn't offer contact support. Errors go to the onError set on Core.
export type CashOutRequestExternalProps = Omit<UIElementProps, 'onContactSupport'> & CashOutRequestProps;

/** How instructing the cashOut ended: the cashOut itself, or an error. */
export type CashOutResult = { status: 'success'; cashOut: ICashOutResponse } | { status: 'error' };

export type CashOutRequestComponentProps = Omit<CashOutRequestExternalProps, 'core' | 'appearance'> & {
    /** The balance account selected initially, which can then be switched. */
    initialBalanceAccountId?: string;
    /** The eligibility of `initialBalanceAccountId`, already loaded by the component that opens this one. */
    eligibility?: ICashOutEligibility;
    hideTitle?: boolean;
    /** Called when the success or error screen replaces the form, so a modal can hide its own title. */
    onResultShown?: () => void;
    /** Passed on by the CashOut Overview when it opens this component in its modal. */
    onContactSupport?: () => void;
};
