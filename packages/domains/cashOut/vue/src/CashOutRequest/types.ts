import type { UIElementProps } from '@integration-components/core/vue';
import type { CashOutRequestProps } from '@integration-components/cashOut/domain';
import type { ICashOutEligibility, ICashOutResponse } from '@integration-components/types';

// Errors go to the onError set on Core.
export type CashOutRequestExternalProps = UIElementProps & CashOutRequestProps;

/**
 * How instructing the cashOut ended: the cashOut itself; an amount above what can be cashed out by then, as what is available changed
 * since it was shown; or another error.
 */
export type CashOutResult = { status: 'success'; cashOut: ICashOutResponse } | { status: 'balanceChanged' } | { status: 'error' };

export type CashOutRequestComponentProps = Omit<CashOutRequestExternalProps, 'core' | 'appearance'> & {
    /** The balance account selected initially, which can then be switched. */
    initialBalanceAccountId?: string;
    /** The eligibility of `initialBalanceAccountId`, already loaded by the component that opens this one. */
    eligibility?: ICashOutEligibility;
    /** Whether the component that opens this one is loading `eligibility` again, so it is waited for instead of fetched here too. */
    isLoadingEligibility?: boolean;
    hideTitle?: boolean;
    /** Set by the CashOut Overview when it shows this component in its modal, whose header already leaves space above the content. */
    inModal?: boolean;
    /** Called when the success or error screen replaces the form, so a modal can hide its own title. */
    onResultShown?: () => void;
    /**
     * Called when the user tries again from the result, such as after the cashOut was rejected because what is available changed, as the
     * form is shown again: the component that gave `eligibility` loads it again, and a modal shows its own title again.
     */
    onTryAgain?: () => void;
    /** Called when the cashOut starts and stops being sent, so a modal can't be closed meanwhile. */
    onInstructingChange?: (isInstructing: boolean) => void;
};
