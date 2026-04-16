import useCoreContext from '../../../../../core/Context/useCoreContext';
import { IBankAccount, IPaymentMethod } from '../../../../../types';
import { Image } from '../../../../internal/Image/Image';
import { Tag } from '../../../../internal/Tag/Tag';
import ThreeDotsLoader from '../../../../internal/ThreeDotsLoader';
import Typography from '../../../../internal/Typography/Typography';
import { CdnComponent } from '../../../../../core/Assets/components/adapters/preact';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';
import { parsePaymentMethodType } from '../utils';

const PaymentMethodCell = ({ paymentMethod, bankAccount }: { paymentMethod?: IPaymentMethod; bankAccount?: IBankAccount }) => {
    const { i18n } = useCoreContext();
    const isSmallContainer = useResponsiveContainer(containerQueries.down.xs);
    return (
        <CdnComponent
            name="PaymentMethodCell"
            loading={<ThreeDotsLoader className="adyen-pe-transactions-table__cell-loader" size="small" />}
            props={{
                bankAccount,
                paymentMethod,
                isSmallContainer,
                parsePaymentMethodType,
                components: { Image, Tag, Typography },
                noDataLabel: i18n.get('common.tags.noData'),
            }}
        />
    );
};

export default PaymentMethodCell;
