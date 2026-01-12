import cx from 'classnames';
import { memo } from 'preact/compat';
import { useModalContext } from '../../../../../internal/Modal/Modal';
import { TX_DATA_CONTAINER, TX_DATA_HEAD_CONTAINER } from '../../constants';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';

const PaymentRefundNotice = memo(() => {
    const { i18n } = useCoreContext();
    const { withinModal } = useModalContext();
    const titleEl = withinModal ? TypographyElement.H2 : TypographyElement.DIV;

    return (
        <div className={cx(TX_DATA_CONTAINER, TX_DATA_HEAD_CONTAINER)}>
            <Typography el={titleEl} variant={TypographyVariant.SUBTITLE} stronger>
                {i18n.get('transactions.details.refund.title')}
            </Typography>
            <Typography variant={TypographyVariant.BODY}>{i18n.get('transactions.details.refund.processingInfo')}</Typography>
        </div>
    );
});

export default PaymentRefundNotice;
