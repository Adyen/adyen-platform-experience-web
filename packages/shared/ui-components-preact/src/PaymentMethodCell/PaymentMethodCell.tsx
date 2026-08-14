import { useCoreContext } from '@integration-components/core/preact';
import { IBankAccount, IPaymentMethod } from '@integration-components/types';
import { Image } from '../Image/Image';
import { Tag } from '../Tag/Tag';
import { TagVariant } from '../Tag/types';
import { TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { containerQueries, useResponsiveContainer } from '@integration-components/hooks-preact';
import { parsePaymentMethodType } from '@integration-components/utils';
import { getPaymentMethodClasses, PAYMENT_METHOD_CLASS, PAYMENT_METHOD_LOGO_CLASS, PAYMENT_METHOD_LOGO_CONTAINER_CLASS } from './constants';
import cx from 'classnames';
import './PaymentMethodCell.scss';

const PaymentMethodCell = ({
    paymentMethod,
    bankAccount,
    baseClassName,
}: {
    paymentMethod?: IPaymentMethod;
    bankAccount?: IBankAccount;
    baseClassName?: string;
}) => {
    const { i18n } = useCoreContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const customClasses = baseClassName ? getPaymentMethodClasses(baseClassName) : undefined;

    return (
        <div className={cx(PAYMENT_METHOD_CLASS, customClasses?.paymentMethod)}>
            {paymentMethod || bankAccount ? (
                <>
                    <div className={cx(PAYMENT_METHOD_LOGO_CONTAINER_CLASS, customClasses?.logoContainer)}>
                        <Image
                            name={paymentMethod ? paymentMethod.type : 'bankTransfer'}
                            alt={paymentMethod ? paymentMethod.type : 'bankTransfer'}
                            folder={'logos/'}
                            className={cx(PAYMENT_METHOD_LOGO_CLASS, customClasses?.logo)}
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
