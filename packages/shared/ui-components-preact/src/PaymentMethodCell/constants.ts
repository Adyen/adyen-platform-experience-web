export const PAYMENT_METHOD_CLASS = 'adyen-pe-payment-method-cell';
export const PAYMENT_METHOD_LOGO_CONTAINER_CLASS = `${PAYMENT_METHOD_CLASS}__logo-container`;
export const PAYMENT_METHOD_LOGO_CLASS = `${PAYMENT_METHOD_CLASS}__logo`;

export const getPaymentMethodClasses = (baseClassName: string) => ({
    paymentMethod: `${baseClassName}__payment-method`,
    logoContainer: `${baseClassName}__payment-method-logo-container`,
    logo: `${baseClassName}__payment-method-logo`,
});
