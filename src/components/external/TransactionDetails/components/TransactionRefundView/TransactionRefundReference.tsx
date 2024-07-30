import { useEffect, useState } from 'preact/hooks';
import { TX_DATA_CONTAINER, TX_DATA_INPUT_CONTAINER, TX_DATA_INPUT_CONTAINER_TEXT, TX_DATA_INPUT_HEAD } from '../../constants';
import useTransactionDataContext from '../../context';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import Typography from '../../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';

const TransactionRefundReference = () => {
    const { i18n } = useCoreContext();
    const { refundReference, updateRefundReference } = useTransactionDataContext();
    const [reference, setReference] = useState(refundReference ?? '');

    useEffect(() => {
        setReference(refundReference ?? '');
    }, [refundReference]);

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {`${i18n.get('refundReference')}`}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_TEXT}`}>
                <label htmlFor="refundReference">
                    <textarea
                        className="adyen-pe-input"
                        id="refundReference"
                        // onKeyUp={() => updateRefundReference(reference)}
                        onInput={evt => setReference(evt.currentTarget.value.trim())}
                        rows={3}
                    >
                        {reference}
                    </textarea>
                </label>
            </div>
        </div>
    );
};

export default TransactionRefundReference;
