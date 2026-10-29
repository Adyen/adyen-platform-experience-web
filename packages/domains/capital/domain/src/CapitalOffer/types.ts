import type { WithDismissCallback } from '@integration-components/types';
import type { OnSubmit } from '../shared';

export interface CapitalOfferProps extends WithDismissCallback {
    onSubmit?: OnSubmit;
}
