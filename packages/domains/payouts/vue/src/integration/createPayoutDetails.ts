import type { DomainComponentInstance } from '@integration-components/domain-integration';
import PayoutDetails from '../PayoutDetails/components/PayoutDetailsContainer.vue';
import { createPayoutsInstance } from './createPayoutsInstance';
import type { PayoutDetailsDomainProps, PayoutDetailsRenderMode, PayoutsDependencies } from './types';

export const createPayoutDetails = (
    props: PayoutDetailsDomainProps,
    dependencies: PayoutsDependencies,
    renderMode: PayoutDetailsRenderMode
): DomainComponentInstance<Partial<PayoutDetailsDomainProps>, Element | string> =>
    createPayoutsInstance('Payout details', PayoutDetails, props, dependencies, { renderMode });
