import { useMemo } from 'preact/hooks';
import { TX_DATA_CONTAINER } from '../../constants';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';

const TransactionRefundNotice = () => {
    const { i18n } = useCoreContext();

    return useMemo(
        () => (
            <div className={TX_DATA_CONTAINER}>
                <Typography el={TypographyElement.DIV} variant={TypographyVariant.SUBTITLE} stronger>
                    {i18n.get('refundAction')}
                </Typography>
                <Typography variant={TypographyVariant.BODY}>{i18n.get('refundNotice')}</Typography>
            </div>
        ),
        [i18n]
    );
};

export default TransactionRefundNotice;
