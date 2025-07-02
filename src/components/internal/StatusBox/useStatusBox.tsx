import { useMemo } from 'preact/hooks';
import { DATE_FORMAT_TRANSACTION_DETAILS } from '../../../constants';
import useCoreContext from '../../../core/Context/useCoreContext';
import useTimezoneAwareDateFormatting from '../../../hooks/useTimezoneAwareDateFormatting';
import { IAmount, IBankAccount, IPaymentMethod } from '../../../types';
import { getDisplayablePaymentMethod, getPaymentMethodType } from './utils';

type StatusBoxDataProps = {
    paymentMethodData?: IPaymentMethod;
    bankAccount?: IBankAccount;
    amountData?: IAmount;
    timezone?: string;
    createdAt?: string;
};

const useStatusBoxData = ({ timezone, paymentMethodData, bankAccount, amountData, createdAt }: StatusBoxDataProps) => {
    const paymentProps = useMemo(() => ({ paymentMethod: paymentMethodData, bankAccount }), [paymentMethodData, bankAccount]);

    const { i18n } = useCoreContext();
    const { dateFormat } = useTimezoneAwareDateFormatting(timezone);

    const amount = useMemo(() => {
        if (amountData) {
            const { currency, value } = amountData;
            return `${i18n.amount(value, currency, { hideCurrency: true })} ${currency}`;
        }
    }, [amountData, i18n]);

    const paymentMethodType = useMemo(() => {
        return getPaymentMethodType(paymentProps);
    }, [paymentProps]);

    const paymentMethod = useMemo(() => {
        return getDisplayablePaymentMethod(paymentProps);
    }, [paymentProps]);

    const date = useMemo(() => {
        return createdAt && dateFormat(new Date(createdAt), DATE_FORMAT_TRANSACTION_DETAILS);
    }, [createdAt, dateFormat]);

    return { amount, date, paymentMethod, paymentMethodType };
};

export default useStatusBoxData;
