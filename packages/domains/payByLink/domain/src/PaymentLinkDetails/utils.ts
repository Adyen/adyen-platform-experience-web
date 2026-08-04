import type { TranslationKey } from '@integration-components/core';
import type {
    IPaymentLinkActivity,
    IPaymentLinkDetails,
    IPaymentLinkShopperAddress,
    IPaymentLinkStatus,
    IPaymentLinkType,
} from '@integration-components/types';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS } from '@integration-components/utils';
import { BACKEND_REDACTED_DATA_MARKER } from '../constants';
import { PAYMENT_LINK_STATUS_TAG_VARIANT } from './constants';
import type {
    ListItemData,
    PaymentLinkActivityStatus,
    PaymentLinkErrorMessageContent,
    PaymentLinkListItems,
    PaymentLinkStatusTagVariant,
} from './types';

type ErrorLike = { errorCode?: string; requestId?: string } | undefined;
type I18nLike = { has: (key: string) => boolean; get: (key: TranslationKey) => string };
type DateFormatFn = (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;

export const getActivityTitleKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.type) {
        case 'createdAction':
            return 'payByLink.details.activity.created';
        case 'expiredAction':
            return 'payByLink.details.activity.expired';
        case 'paymentAttempt':
            return 'payByLink.details.activity.paymentAttempt';
        default:
            return undefined;
    }
};

export const getActivityDescriptionKey = (activity: IPaymentLinkActivity): TranslationKey | undefined => {
    switch (activity.expirationReason) {
        case 'maximumAttemptsReached':
            return 'payByLink.details.activity.expirationReason.maximumAttemptsReached';
        case 'manuallyExpired':
            return 'payByLink.details.activity.expirationReason.manuallyExpired';
        case 'expirationDateReached':
            return 'payByLink.details.activity.expirationReason.expirationDateReached';
        default:
            return undefined;
    }
};

export const getActivityStatus = (activity: IPaymentLinkActivity): PaymentLinkActivityStatus => {
    switch (activity.type) {
        case 'createdAction':
            return 'green';
        case 'expiredAction':
            return 'red';
        case 'paymentAttempt':
            return 'blue';
        default:
            return 'black';
    }
};

export const isPaymentLinkAddressRedacted = (address: IPaymentLinkShopperAddress): boolean => {
    return Object.values(address).some(value => value === BACKEND_REDACTED_DATA_MARKER);
};

export const getPaymentLinkStatusTagVariant = (status: IPaymentLinkStatus | undefined): PaymentLinkStatusTagVariant => {
    return (status && PAYMENT_LINK_STATUS_TAG_VARIANT[status]) ?? 'neutral';
};

export const getPaymentLinkStatusLabel = (i18n: I18nLike, status: IPaymentLinkStatus | undefined): string | undefined => {
    if (!status) return undefined;
    return i18n.has(`payByLink.common.status.${status}`) ? i18n.get(`payByLink.common.status.${status}` as TranslationKey) : status;
};

export const getPaymentLinkTypeLabel = (i18n: I18nLike, linkType: IPaymentLinkType | undefined): string | undefined => {
    if (!linkType) return undefined;
    return i18n.has(`payByLink.common.linkType.${linkType}`) ? i18n.get(`payByLink.common.linkType.${linkType}` as TranslationKey) : linkType;
};

const filterEmptyListItems = (items: ListItemData[]): ListItemData[] => items.filter(item => item.value != null && item.value !== '');

export const buildPaymentLinkListItems = (
    paymentLink: IPaymentLinkDetails,
    { i18n, dateFormat }: { i18n: I18nLike; dateFormat: DateFormatFn }
): PaymentLinkListItems => {
    const shippingAddress = paymentLink.shopperInformation?.shippingAddress;
    const billingAddress = paymentLink.shopperInformation?.billingAddress;
    const isShippingAddressRedacted = !!shippingAddress && isPaymentLinkAddressRedacted(shippingAddress);
    const isBillingAddressRedacted = !!billingAddress && isPaymentLinkAddressRedacted(billingAddress);

    const linkInformation: ListItemData[] = filterEmptyListItems([
        {
            key: 'payByLink.details.fields.paymentLinkId',
            value: paymentLink.linkInformation.paymentLinkId,
            isCopyable: true,
            linkUrl: paymentLink.linkInformation.paymentLink,
        },
        { key: 'payByLink.details.fields.store', value: paymentLink.linkInformation.storeCode },
        { key: 'payByLink.details.fields.merchantReference', value: paymentLink.linkInformation.merchantReference },
        {
            key: 'payByLink.details.fields.createdOn',
            value: dateFormat(paymentLink.linkInformation.creationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS),
        },
        {
            key: 'payByLink.details.fields.expiresOn',
            value: dateFormat(paymentLink.linkInformation.expirationDate, DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS),
        },
        { key: 'payByLink.details.fields.linkType', value: getPaymentLinkTypeLabel(i18n, paymentLink.linkInformation.linkType) },
        { key: 'payByLink.details.fields.description', value: paymentLink.linkInformation.description },
    ]);

    const shopperInformation: ListItemData[] = filterEmptyListItems([
        { key: 'payByLink.details.fields.shopper.reference', value: paymentLink.shopperInformation?.shopperReference },
        {
            key: 'payByLink.details.fields.shopper.fullName',
            value: [paymentLink.shopperInformation?.shopperName?.firstName, paymentLink.shopperInformation?.shopperName?.lastName]
                .filter(Boolean)
                .join(' '),
            isCopyable: true,
        },
        { key: 'payByLink.details.fields.shopper.email', value: paymentLink.shopperInformation?.shopperEmail, isCopyable: true },
        { key: 'payByLink.details.fields.shopper.phone', value: paymentLink.shopperInformation?.telephoneNumber, isCopyable: true },
        { key: 'payByLink.details.fields.shopper.country', value: paymentLink.shopperInformation?.shopperCountry },
        ...(isShippingAddressRedacted
            ? [{ key: 'payByLink.details.fields.shippingAddress.title' as TranslationKey, value: BACKEND_REDACTED_DATA_MARKER }]
            : []),
        ...(isBillingAddressRedacted
            ? [{ key: 'payByLink.details.fields.billingAddress.title' as TranslationKey, value: BACKEND_REDACTED_DATA_MARKER }]
            : []),
    ]);

    const buildAddressItems = (prefix: 'shippingAddress' | 'billingAddress', address?: IPaymentLinkShopperAddress): ListItemData[] =>
        !address
            ? []
            : filterEmptyListItems([
                  { key: `payByLink.details.fields.${prefix}.street` as TranslationKey, value: address.street, isCopyable: true },
                  {
                      key: `payByLink.details.fields.${prefix}.houseNumberOrName` as TranslationKey,
                      value: address.houseNumberOrName,
                      isCopyable: true,
                  },
                  { key: `payByLink.details.fields.${prefix}.country` as TranslationKey, value: address.country },
                  { key: `payByLink.details.fields.${prefix}.city` as TranslationKey, value: address.city, isCopyable: true },
                  { key: `payByLink.details.fields.${prefix}.postalCode` as TranslationKey, value: address.postalCode, isCopyable: true },
              ]);

    return {
        linkInformation,
        shopperInformation,
        shippingAddress: isShippingAddressRedacted ? [] : buildAddressItems('shippingAddress', shippingAddress),
        billingAddress: isBillingAddressRedacted ? [] : buildAddressItems('billingAddress', billingAddress),
    };
};

export const getPaymentLinkErrorMessageContent = (
    error: ErrorLike,
    errorMessage: TranslationKey,
    hasContactSupport: boolean
): PaymentLinkErrorMessageContent => {
    if (!error) return { title: 'common.errors.unexpected', message: ['common.errors.contactSupport'] };

    switch (error.errorCode) {
        case undefined:
            return { title: 'common.errors.somethingWentWrong', message: [errorMessage, 'common.errors.retry'], refreshComponent: true };
        case '500':
            return {
                title: 'common.errors.somethingWentWrong',
                message: [errorMessage, hasContactSupport ? 'common.errors.errorCode' : 'common.errors.errorCodeSupport'],
                requestId: error.requestId,
            };
        default:
            return { title: 'common.errors.unexpected', message: ['common.errors.contactSupport'] };
    }
};
