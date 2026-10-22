import type { WithDismissCallback } from '@integration-components/types';
import type { OnFundsRequestCallback } from '../shared';

export interface CapitalOfferProps extends WithDismissCallback {
    onFundsRequest?: OnFundsRequestCallback;
}
