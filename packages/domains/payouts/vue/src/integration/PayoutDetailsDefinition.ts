import { defineDomainComponent } from '@integration-components/domain-integration';
import { createPayoutDetails } from './createPayoutDetails';
import type { PayoutDetailsDomainProps, PayoutsDependencies } from './types';

export const PayoutDetailsDefinition = defineDomainComponent<
    PayoutDetailsDomainProps,
    PayoutsDependencies,
    Partial<PayoutDetailsDomainProps>,
    Element | string
>()({
    create: ({ dependencies, props }) => createPayoutDetails(props, dependencies, 'standalone'),
});
