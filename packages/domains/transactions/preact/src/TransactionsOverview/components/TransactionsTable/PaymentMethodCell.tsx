import { useCoreContext } from '@integration-components/core/preact';
import { IBankAccount, IPaymentMethod } from '@integration-components/types';
import { Image } from '../../../../../../../../src/components/internal/Image/Image';
import { Tag } from '../../../../../../../../src/components/internal/Tag/Tag';
import { TagVariant } from '../../../../../../../../src/components/internal/Tag/types';
import { TypographyVariant } from '../../../../../../../../src/components/internal/Typography/types';
import Typography from '../../../../../../../../src/components/internal/Typography/Typography';
import { containerQueries, useResponsiveContainer } from '@integration-components/hooks-preact';
import { parsePaymentMethodType } from '../utils';
import { PAYMENT_METHOD_CLASS, PAYMENT_METHOD_LOGO_CLASS, PAYMENT_METHOD_LOGO_CONTAINER_CLASS } from './constants';

const PaymentMethodCell = ({ paymentMethod, bankAccount }: { paymentMethod?: IPaymentMethod; bankAccount?: IBankAccount }) => {
    const { i18n } = useCoreContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);

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
                    <Typography variant={TypographyVariant.BODY} stronger={isSmContainer}>
                        {paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits}
                    </Typography>
                </>
            ) : (
                <Tag label={i18n.get('common.tags.noData')} variant={TagVariant.LIGHT_WITH_OUTLINE} />
            )}
        </div>
    );
};

export default PaymentMethodCell;
