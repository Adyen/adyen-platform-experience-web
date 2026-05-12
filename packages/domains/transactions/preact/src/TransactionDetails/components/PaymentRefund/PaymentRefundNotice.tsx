import cx from 'classnames';
import { memo } from 'preact/compat';
import { useModalContext } from '@integration-components/ui-components-preact/Modal/Modal';
import { TX_DATA_CONTAINER, TX_DATA_HEAD_CONTAINER } from '../../constants';
import { TypographyElement, TypographyVariant } from '@integration-components/ui-components-preact/Typography/types';
import { useCoreContext } from '@integration-components/core/preact';
import Typography from '@integration-components/ui-components-preact/Typography/Typography';

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
