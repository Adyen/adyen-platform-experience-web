import {
    REFUND_REFERENCE_CHAR_LIMIT,
    TX_DATA_CONTAINER,
    TX_DATA_INPUT,
    TX_DATA_INPUT_CHARS,
    TX_DATA_INPUT_CONTAINER,
    TX_DATA_INPUT_CONTAINER_TEXT,
    TX_DATA_INPUT_HEAD,
    TX_DATA_INPUT_TEXTAREA,
} from '../../constants';
import { h } from 'preact';
import { useRef, useState } from 'preact/hooks';
import { uniqueId } from '../../../../../../utils';
import { useInputNormalizer } from '../../hooks/useInputNormalizer';
import { TypographyElement, TypographyVariant } from '../../../../../internal/Typography/types';
import useCoreContext from '../../../../../../core/Context/useCoreContext';
import Typography from '../../../../../internal/Typography/Typography';
import TextArea from '../../../../../internal/FormFields/TextArea';

const PaymentRefundReference = () => {
    const { i18n } = useCoreContext();
    const [reference, setReference] = useState('');
    const [characters, setCharactersCount] = useState(reference.length);

    const inputNormalizer = useInputNormalizer(REFUND_REFERENCE_CHAR_LIMIT);
    const inputIdentifier = useRef(uniqueId());
    const labelIdentifier = useRef(uniqueId());

    const onInput = (evt: h.JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
        const textarea = evt.currentTarget;
        const selectionEnd = textarea.selectionEnd;
        const value = inputNormalizer(textarea.value); // [TODO]: Confirm reference validation from backend

        textarea.value = value;
        textarea.setSelectionRange(selectionEnd, selectionEnd);

        if (value !== reference) {
            setReference(value);
            setCharactersCount(value.length);
        }
    };

    return (
        <div className={TX_DATA_CONTAINER}>
            <div className={TX_DATA_INPUT_HEAD}>
                <div id={labelIdentifier.current}>
                    <Typography el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger>
                        {i18n.get('transactions.details.refund.inputs.reference.label')}
                    </Typography>
                </div>
                <Typography className={TX_DATA_INPUT_CHARS} el={TypographyElement.DIV} variant={TypographyVariant.BODY}>
                    {characters} / {REFUND_REFERENCE_CHAR_LIMIT}
                </Typography>
            </div>

            <div className={`${TX_DATA_INPUT_CONTAINER} ${TX_DATA_INPUT_CONTAINER_TEXT}`}>
                <label htmlFor={inputIdentifier.current} aria-labelledby={labelIdentifier.current}>
                    <TextArea
                        id={inputIdentifier.current}
                        className={`${TX_DATA_INPUT} ${TX_DATA_INPUT_TEXTAREA}`}
                        placeholder={i18n.get('transactions.details.refund.inputs.reference.placeholder')}
                        value={reference}
                        onInput={onInput}
                        maxRows={2}
                    />
                </label>
            </div>
        </div>
    );
};

export default PaymentRefundReference;
