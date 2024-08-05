import {
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CHARS,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_HEAD,
    TX_DATA_INPUT_TEXTAREA,
} from '../constants';
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useInputNormalizer } from '../context/useInputNormalizer';
import { REFUND_REFERENCE_CHAR_LIMIT, useTransactionDataContext } from '../context';
import useCoreContext from '../../../../core/Context/useCoreContext';
import TextArea from '../../../internal/FormFields/TextArea';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';

const TransactionRefundReference = () => {
    const { i18n } = useCoreContext();
    const { refundReference, updateRefundReference } = useTransactionDataContext();
    const [reference, setReference] = useState(refundReference ?? '');
    const [characters, setCharactersCount] = useState(reference.length);

    const inputNormalizer = useInputNormalizer(REFUND_REFERENCE_CHAR_LIMIT);

    const onInput = (evt: h.JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
        const textarea = evt.currentTarget;
        const selectionEnd = textarea.selectionEnd;
        const value = inputNormalizer(textarea.value); // [TODO]: Confirm reference validation from backend

        textarea.value = value;
        textarea.setSelectionRange(selectionEnd, selectionEnd);

        if (value !== reference) {
            setReference(value);
            setCharactersCount(value.length);
            updateRefundReference(value);
        }
    };

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                    {`${i18n.get('refundReference')}`}
                </Typography>
                <Typography className={TX_DATA_INPUT_CHARS} el={TypographyElement.SPAN} variant={TypographyVariant.BODY}>
                    {characters} / {REFUND_REFERENCE_CHAR_LIMIT}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_TEXT}`}>
                <label htmlFor="refundReference">
                    <TextArea
                        id="refundReference"
                        className={`${TX_DATA_INPUT} ${TX_DATA_INPUT_TEXTAREA}`}
                        placeholder={i18n.get('refundReference.placeholder')}
                        value={reference}
                        onInput={onInput}
                        maxRows={2}
                    />
                </label>
            </div>
        </div>
    );
};

export default TransactionRefundReference;
