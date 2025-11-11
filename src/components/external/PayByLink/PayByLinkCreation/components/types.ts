import { PaymentLinkConfiguration } from '../../../../../types/api/models/payByLink';

export type LinkCreationFormStep = 'Store' | 'Payment' | 'Customer' | 'Summary';

const defaultFormValues = {
    // Store selection
    store: '',

    // Payment details
    linkValidity: '',
    amountValue: 1,
    currency: '',
    merchantReference: '',
    linkType: '',
    description: '',
    deliveryDate: '',

    // Customer details
    shopperReference: '',
    fullName: '',
    emailAddress: '',
    emailSender: '',
    phoneNumber: 1,
    countryCode: '',
    shippingAddress: '',
    billingAddress: '',
    shopperLocale: '',
} satisfies Record<keyof PaymentLinkConfiguration, any>;

export type FormValues = Partial<typeof defaultFormValues>;
