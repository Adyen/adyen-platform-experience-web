import { PAYMENT_METHOD_CLASS, PAYMENT_METHOD_LOGO_CLASS, PAYMENT_METHOD_LOGO_CONTAINER_CLASS } from './constants';
import { Image } from '../../../../internal/Image/Image';
import { parsePaymentMethodType } from '../utils';
import { ITransaction } from '../../../../../types';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { useTranslation } from 'react-i18next';

const PaymentMethodCell = ({
    paymentMethod,
    bankAccount,
}: {
    paymentMethod?: ITransaction['paymentMethod'];
    bankAccount?: ITransaction['bankAccount'];
}) => {
    const { t } = useTranslation();
    return (
        <div className={PAYMENT_METHOD_CLASS}>
            {paymentMethod || bankAccount ? (
                <>
                    <div className={PAYMENT_METHOD_LOGO_CONTAINER_CLASS}>
                        <Image
                            name={paymentMethod ? paymentMethod.type : 'bankTransfer'}
                            alt={paymentMethod ? paymentMethod.type : 'bankTransfer'}
                            folder={'logos/'}
                            className={PAYMENT_METHOD_LOGO_CLASS}
                        />
                    </div>
                    {paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits}
                </>
            ) : (
                <Tag label={t('noData')} variant={TagVariant.WHITE} />
            )}
        </div>
    );
};

export default PaymentMethodCell;
