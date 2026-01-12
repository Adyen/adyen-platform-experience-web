import { IBankAccount, IPaymentMethod } from '../../../types';
import { parsePaymentMethodType } from '../../external/Transactions/TransactionsOverview/components/utils';

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
