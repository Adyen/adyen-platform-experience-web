import getCurrency from './getCurrency';
const DEFAULT_LOCALE = 'en-US';
const DEFAULT_COUNTRY = 'US';

const merchantAccount = 'TestMerchantCheckout';
export const shopperLocale = DEFAULT_LOCALE;
export const countryCode = DEFAULT_COUNTRY;
export const currency = getCurrency(countryCode);
export const amountValue = 25940;
export const shopperReference = 'newshoppert';
export const amount = {
    currency,
    value: Number(amountValue),
};

export const useSession = true;

export const returnUrl = `http://localhost:3030/result`;

export default {
    amount,
    countryCode,
    shopperLocale,
    channel: 'Web',
    shopperReference,
    ...(merchantAccount && { merchantAccount }),
};
