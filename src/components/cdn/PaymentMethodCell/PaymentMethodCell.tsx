import type { FunctionComponent } from 'preact';
import type { IBankAccount, IPaymentMethod } from '../../../types';
import type { TagProps } from '../../internal/Tag/types';
import type { ImageProps } from '../../internal/Image/Image';
import type { TypographyProps } from '../../internal/Typography/Typography';
import { parsePaymentMethodType } from '../../external/TransactionsOverview/components/utils';
import { TypographyVariant } from '../../internal/Typography/types';
import { TagVariant } from '../../internal/Tag/types';
import {
    PAYMENT_METHOD_CLASS,
    PAYMENT_METHOD_LOGO_CLASS,
    PAYMENT_METHOD_LOGO_CONTAINER_CLASS,
} from '../../external/TransactionsOverview/components/TransactionsTable/constants';

export type PaymentMethodCellProps = {
    bankAccount?: IBankAccount;
    paymentMethod?: IPaymentMethod;
    parsePaymentMethodType: typeof parsePaymentMethodType;
    isSmallContainer?: boolean;
    noDataLabel: string;
    components: {
        Image: FunctionComponent<ImageProps>;
        Tag: FunctionComponent<TagProps>;
        Typography: FunctionComponent<TypographyProps>;
    };
};

const PaymentMethodCell = ({
    bankAccount,
    paymentMethod,
    parsePaymentMethodType,
    isSmallContainer,
    noDataLabel,
    components,
}: PaymentMethodCellProps) => {
    const { Image, Tag, Typography } = components;
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
                    <Typography variant={TypographyVariant.BODY} stronger={isSmallContainer}>
                        {paymentMethod ? parsePaymentMethodType(paymentMethod) : bankAccount?.accountNumberLastFourDigits}
                    </Typography>
                </>
            ) : (
                <Tag label={noDataLabel} variant={TagVariant.LIGHT_WITH_OUTLINE} />
            )}
        </div>
    );
};

export default PaymentMethodCell;
