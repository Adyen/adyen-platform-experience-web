import { useState } from 'preact/hooks';
import { TX_DATA_CONTAINER } from '../../constants';
import useTransactionDataContext from '../../context';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';

const TransactionRefundReference = () => {
    const { i18n } = useCoreContext();
    const { refundReference, updateRefundReference } = useTransactionDataContext();
    const [reference, setReference] = useState(refundReference);

    return (
        <div className={TX_DATA_CONTAINER}>
            <div>
                <label htmlFor="refundAmount">
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {`${i18n.get('refundReference')}`}
                    </Typography>
                </label>
                <textarea className="adyen-pe-input" value={reference} rows={3} />
            </div>
        </div>
    );
};

export default TransactionRefundReference;
