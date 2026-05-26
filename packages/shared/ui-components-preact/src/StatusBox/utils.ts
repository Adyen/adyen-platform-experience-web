import { IBankAccount, IPaymentMethod } from '@integration-components/types';
import { parsePaymentMethodType } from '../PaymentMethodCell/parsePaymentMethodType';

type PaymentOptionsType = {
    paymentMethod?: IPaymentMethod;
    bankAccount?: IBankAccount;
};

export const getPaymentMethodType = (data: PaymentOptionsType) => {
    return data?.paymentMethod ? data.paymentMethod.type : data?.bankAccount ? 'bankTransfer' : null;
};

export const getDisplayablePaymentMethod = (data: PaymentOptionsType) => {
    return data?.paymentMethod ? parsePaymentMethodType(data.paymentMethod, 'detail') : data?.bankAccount?.accountNumberLastFourDigits;
};
