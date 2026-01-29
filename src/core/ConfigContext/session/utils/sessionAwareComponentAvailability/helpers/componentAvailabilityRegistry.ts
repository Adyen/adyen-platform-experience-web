import { isFunction } from '../../../../../../utils';
import AuthSession from '../../../AuthSession';
import type { ExternalComponentAvailabilityRegistry } from '../types';

const getComponentAvailabilityFromEndpoint = (context: AuthSession['context'], endpoint: keyof AuthSession['context']['endpoints']) => {
    return isFunction(context.endpoints[endpoint]);
};

const componentAvailabilityRegistry: ExternalComponentAvailabilityRegistry = {
    transactions: context => getComponentAvailabilityFromEndpoint(context, 'getTransactions'),
    transactionDetails: context => getComponentAvailabilityFromEndpoint(context, 'getTransaction'),
    payouts: context => getComponentAvailabilityFromEndpoint(context, 'getPayouts'),
    payoutDetails: context => getComponentAvailabilityFromEndpoint(context, 'getPayout'),
    reports: context => getComponentAvailabilityFromEndpoint(context, 'getReports'),
    capitalOverview: context => getComponentAvailabilityFromEndpoint(context, 'getDynamicGrantOffersConfiguration'),
    capitalOffer: context => getComponentAvailabilityFromEndpoint(context, 'getDynamicGrantOffer'),
    disputes: context => getComponentAvailabilityFromEndpoint(context, 'getDisputeList'),
    disputesManagement: context => getComponentAvailabilityFromEndpoint(context, 'getDisputeDetail'),
    paymentLinksOverview: context => getComponentAvailabilityFromEndpoint(context, 'getPaymentLinks'),
    paymentLinkCreation: context => getComponentAvailabilityFromEndpoint(context, 'getPayByLinkConfiguration'),
    paymentLinkSettings: context => getComponentAvailabilityFromEndpoint(context, 'savePayByLinkSettings'),
    paymentLinkDetails: context => getComponentAvailabilityFromEndpoint(context, 'getPayByLinkPaymentLinkById'),
};

export default componentAvailabilityRegistry;
