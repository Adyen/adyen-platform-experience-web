import {
    createDynamicTranslationFactory,
    createKeyFactoryFromConfig,
    type KeyFactoryFunction,
    type TranslationFallbackFunction,
} from '@integration-components/core';
import type { IPaymentLinkStatus, IPaymentLinkType } from '@integration-components/types';
import { PAYMENT_LINK_STATUSES, PAYMENT_LINK_TYPES } from '../PaymentLinksOverview';

const originalValueFallback: TranslationFallbackFunction = (_, value) => value;

const paymentLinkStatusKey = createKeyFactoryFromConfig({ prefix: 'payByLink.common.statuses.' });

const paymentLinkStatusKeyFactory: KeyFactoryFunction = status =>
    status && (PAYMENT_LINK_STATUSES[status as IPaymentLinkStatus] ?? paymentLinkStatusKey(status));

export const getPaymentLinkStatus = createDynamicTranslationFactory(paymentLinkStatusKeyFactory, originalValueFallback);

const paymentLinkTypeKey = createKeyFactoryFromConfig({ prefix: 'payByLink.common.linkType.' });

const paymentLinkTypeKeyFactory: KeyFactoryFunction = linkType =>
    linkType && (PAYMENT_LINK_TYPES[linkType as IPaymentLinkType] ?? paymentLinkTypeKey(linkType));

export const getPaymentLinkType = createDynamicTranslationFactory(paymentLinkTypeKeyFactory, originalValueFallback);
