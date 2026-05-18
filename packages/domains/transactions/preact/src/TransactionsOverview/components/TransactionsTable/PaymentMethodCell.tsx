import { useCoreContext } from '@integration-components/core/preact';
import { IBankAccount, IPaymentMethod } from '@integration-components/types';
import { Image } from '@integration-components/ui-components-preact/Image/Image';
import { Tag } from '@integration-components/ui-components-preact/Tag/Tag';
import { TagVariant } from '@integration-components/ui-components-preact/Tag/types';
import { TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';
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
