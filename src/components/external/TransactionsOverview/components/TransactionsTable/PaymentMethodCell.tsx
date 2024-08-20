import useCoreContext from '../../../../../core/Context/useCoreContext';
import { ITransaction } from '../../../../../types';
import { Image } from '../../../../internal/Image/Image';
import { Tag } from '../../../../internal/Tag/Tag';
import { TagVariant } from '../../../../internal/Tag/types';
import { TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import { mediaQueries, useResponsiveViewport } from '../../hooks/useResponsiveViewport';
import { parsePaymentMethodType } from '../utils';
import { PAYMENT_METHOD_CLASS, PAYMENT_METHOD_LOGO_CLASS, PAYMENT_METHOD_LOGO_CONTAINER_CLASS } from './constants';

const PaymentMethodCell = ({
    paymentMethod,
    bankAccount,
}: {
    paymentMethod?: ITransaction['paymentMethod'];
    bankAccount?: ITransaction['bankAccount'];
}) => {
    const { i18n } = useCoreContext();
    const isSmViewport = useResponsiveViewport(mediaQueries.down.xs);

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
                    <Typography variant={TypographyVariant.BODY} stronger={isSmViewport}>
                        {paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits}
                    </Typography>
                </>
            ) : (
                <Tag label={i18n.get('noData')} variant={TagVariant.WHITE} />
            )}
        </div>
    );
};

export default PaymentMethodCell;
