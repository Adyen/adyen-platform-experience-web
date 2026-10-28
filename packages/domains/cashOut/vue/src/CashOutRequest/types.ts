import type { CoreInstance } from '@integration-components/core/vue';
import type { ICashOutEligibility, ICashOutResponse, UIElementProps } from '@integration-components/types';
import type { CashOutIntegrationProps } from '../shared/types';

// The standalone component doesn't offer contact support. Errors go to the onError set on Core, as the component has no onError of its own.
export type CashOutRequestExternalProps = Omit<UIElementProps, 'ref' | 'onContactSupport' | 'onError'> &
    CashOutIntegrationProps & {
        core: CoreInstance;
        /**
         * Called when the user clicks the cancel button, or the close button of the success and error screens, to close the component.
         * Without it, these buttons are hidden.
         */
        onDismiss?: () => void;
    };

/** How instructing the cashOut ended: the cashOut itself, or an error. */
export type CashOutResult = { status: 'success'; cashOut: ICashOutResponse } | { status: 'error' };

export type CashOutRequestProps = Omit<CashOutRequestExternalProps, 'core'> & {
    /** The balance account selected initially, which can then be switched. */
    initialBalanceAccountId?: string;
    /** The eligibility of `initialBalanceAccountId`, already loaded by the component that opens this one. */
    eligibility?: ICashOutEligibility;
    hideTitle?: boolean;
    /** Called when the success or error screen replaces the form, so a modal can hide its own title. */
    onCashOutResult?: (result: CashOutResult) => void;
    /** Passed on by the CashOut Overview when it opens this component in its modal. */
    onContactSupport?: () => void;
};
