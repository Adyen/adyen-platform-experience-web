import type Localization from '@integration-components/core/Localization';
import type { IPaymentLinkActivity, IPaymentLinkDetails, IPaymentLinkShopperAddress, IPaymentLinkStatus } from '@integration-components/types';
import { DATE_FORMAT_PAYMENT_LINK_DETAILS_TABS } from '@integration-components/utils';
import { BACKEND_REDACTED_DATA_MARKER } from '../constants';
import type { PayByLinkTranslationKey } from '../shared/types';
import { PAYMENT_LINK_STATUS_TAG_VARIANT } from './constants';
import { getPaymentLinkType } from './translations';
import type {
    ListItemData,
    PaymentLinkActivityStatus,
    PaymentLinkErrorMessageContent,
    PaymentLinkListItems,
    PaymentLinkStatusTagVariant,
} from './types';

type ErrorLike = { errorCode?: string; requestId?: string } | undefined;
type DateFormatFn = (date: string | Date, options?: Intl.DateTimeFormatOptions) => string;

export const getActivityTitleKey = (activity: IPaymentLinkActivity): PayByLinkTranslationKey | undefined => {
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

export const getActivityDescriptionKey = (activity: IPaymentLinkActivity): PayByLinkTranslationKey | undefined => {
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
    return Object.values(address).includes(BACKEND_REDACTED_DATA_MARKER);
};

export const getPaymentLinkStatusTagVariant = (status: IPaymentLinkStatus | undefined): PaymentLinkStatusTagVariant => {
    return (status && PAYMENT_LINK_STATUS_TAG_VARIANT[status]) ?? 'neutral';
};

const filterEmptyListItems = (items: ListItemData[]): ListItemData[] => items.filter(item => item.value != null && item.value !== '');

// Shipping and billing rows carry the same field names, so each address keeps
// its own copy labels rather than sharing one built from the field name.
const ADDRESS_COPY_LABEL_KEYS = {
    shippingAddress: {
        street: 'payByLink.details.actions.copyShippingAddressStreet',
        houseNumberOrName: 'payByLink.details.actions.copyShippingAddressHouseNumberOrName',
        city: 'payByLink.details.actions.copyShippingAddressCity',
        postalCode: 'payByLink.details.actions.copyShippingAddressPostalCode',
    },
    billingAddress: {
        street: 'payByLink.details.actions.copyBillingAddressStreet',
        houseNumberOrName: 'payByLink.details.actions.copyBillingAddressHouseNumberOrName',
        city: 'payByLink.details.actions.copyBillingAddressCity',
        postalCode: 'payByLink.details.actions.copyBillingAddressPostalCode',
    },
} as const satisfies Record<'shippingAddress' | 'billingAddress', Record<string, PayByLinkTranslationKey>>;

export const buildPaymentLinkListItems = (
    paymentLink: IPaymentLinkDetails,
    { i18n, dateFormat }: { i18n: Localization['i18n']; dateFormat: DateFormatFn }
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
            copyAriaLabelKey: 'payByLink.details.actions.copyPaymentLinkId',
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
        { key: 'payByLink.details.fields.linkType', value: getPaymentLinkType(i18n, paymentLink.linkInformation.linkType) },
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
            copyAriaLabelKey: 'payByLink.details.actions.copyShopperFullName',
        },
        {
            key: 'payByLink.details.fields.shopper.email',
            value: paymentLink.shopperInformation?.shopperEmail,
            isCopyable: true,
            copyAriaLabelKey: 'payByLink.details.actions.copyShopperEmail',
        },
        {
            key: 'payByLink.details.fields.shopper.phone',
            value: paymentLink.shopperInformation?.telephoneNumber,
            isCopyable: true,
            copyAriaLabelKey: 'payByLink.details.actions.copyShopperPhone',
        },
        { key: 'payByLink.details.fields.shopper.country', value: paymentLink.shopperInformation?.shopperCountry },
        ...(isShippingAddressRedacted
            ? [{ key: 'payByLink.details.fields.shippingAddress.title' as PayByLinkTranslationKey, value: BACKEND_REDACTED_DATA_MARKER }]
            : []),
        ...(isBillingAddressRedacted
            ? [{ key: 'payByLink.details.fields.billingAddress.title' as PayByLinkTranslationKey, value: BACKEND_REDACTED_DATA_MARKER }]
            : []),
    ]);

    const buildAddressItems = (prefix: 'shippingAddress' | 'billingAddress', address?: IPaymentLinkShopperAddress): ListItemData[] =>
        !address
            ? []
            : filterEmptyListItems([
                  {
                      key: `payByLink.details.fields.${prefix}.street` as PayByLinkTranslationKey,
                      value: address.street,
                      isCopyable: true,
                      copyAriaLabelKey: ADDRESS_COPY_LABEL_KEYS[prefix].street,
                  },
                  {
                      key: `payByLink.details.fields.${prefix}.houseNumberOrName` as PayByLinkTranslationKey,
                      value: address.houseNumberOrName,
                      isCopyable: true,
                      copyAriaLabelKey: ADDRESS_COPY_LABEL_KEYS[prefix].houseNumberOrName,
                  },
                  { key: `payByLink.details.fields.${prefix}.country` as PayByLinkTranslationKey, value: address.country },
                  {
                      key: `payByLink.details.fields.${prefix}.city` as PayByLinkTranslationKey,
                      value: address.city,
                      isCopyable: true,
                      copyAriaLabelKey: ADDRESS_COPY_LABEL_KEYS[prefix].city,
                  },
                  {
                      key: `payByLink.details.fields.${prefix}.postalCode` as PayByLinkTranslationKey,
                      value: address.postalCode,
                      isCopyable: true,
                      copyAriaLabelKey: ADDRESS_COPY_LABEL_KEYS[prefix].postalCode,
                  },
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
    errorMessage: PayByLinkTranslationKey,
    hasContactSupport: boolean
): PaymentLinkErrorMessageContent => {
    if (!error) return { title: 'payByLink.common.errors.unexpected', message: ['payByLink.common.errors.contactSupport'] };

    switch (error.errorCode) {
        case undefined:
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                message: [errorMessage, 'payByLink.common.errors.retry'],
                refreshComponent: true,
            };
        case '500':
            return {
                title: 'payByLink.common.errors.somethingWentWrong',
                message: [errorMessage, hasContactSupport ? 'payByLink.common.errors.errorCode' : 'payByLink.common.errors.errorCodeSupport'],
                requestId: error.requestId,
            };
        default:
            return { title: 'payByLink.common.errors.unexpected', message: ['payByLink.common.errors.contactSupport'] };
    }
};
