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

const useStatusBoxData = ({ timezone, paymentMethodData, bankAccount, amountData, createdAt: date }: StatusBoxDataProps) => {
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

    const formattedDate = useMemo(() => {
        return date && dateFormat(date, DATE_FORMAT_TRANSACTION_DETAILS);
    }, [date, dateFormat]);

    return { amount, date, formattedDate, paymentMethod, paymentMethodType };
};

export default useStatusBoxData;
