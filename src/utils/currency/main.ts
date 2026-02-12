import { getDecimalAmount, getDivider } from '../../core/Localization/amount/amount-util';

export const formatAmount = (amount: number, currency: string) => getDecimalAmount(amount, currency).toFixed(getCurrencyExponent(currency));
export const getCurrencyExponent = (currency: string) => Math.log10(getDivider(currency));
