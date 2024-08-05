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
import { useCallback, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { useInputNormalizer } from '../context/useInputNormalizer';
import { REFUND_REFERENCE_CHAR_LIMIT, useTransactionDataContext } from '../context';
import useCoreContext from '../../../../core/Context/useCoreContext';
import Typography from '../../../internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../../internal/Typography/types';
import { EMPTY_OBJECT, isUndefined } from '../../../../utils';
import cx from 'classnames';

const TextArea = (props: h.JSX.HTMLAttributes<HTMLTextAreaElement> & { maxRows?: number }) => {
    const { className, maxRows, onInput, rows, ...externalProps } = props;
    const { inputRef, recomputeInputSize } = useAutoResizableTextArea({ maxRows, minRows: rows as number });

    const autoResizeOnInput = useCallback(
        (evt: h.JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
            onInput?.(evt);
            if (inputValue.current !== evt.currentTarget.value) {
                inputValue.current = evt.currentTarget.value;
                recomputeInputSize();
            }
        },
        [onInput, recomputeInputSize]
    );

    const autoResizable = !isUndefined(maxRows);
    const inputValue = useRef('');

    return (
        <div
            className={cx('adyen-pe-input-wrapper', {
                'adyen-pe-input-wrapper--autoresizable-textarea': autoResizable,
            })}
        >
            <textarea
                {...externalProps}
                {...(!autoResizable && { rows })}
                onInput={autoResizable ? autoResizeOnInput : onInput}
                className={cx('adyen-pe-input', className)}
                ref={inputRef}
            />
        </div>
    );
};

const useAutoResizableTextArea = ({ maxRows, minRows = 1 } = EMPTY_OBJECT as { maxRows?: number; minRows?: number }) => {
    const [lastUpdated, setLastUpdated] = useState(performance.now());
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const inputOriginHeight = useRef(0);
    const inputLineHeight = useRef(0);

    const recomputeInputSize = useCallback(() => {
        setLastUpdated(performance.now());
        inputRef.current && (inputRef.current.rows = minRows);
    }, [minRows, maxRows]);

    useLayoutEffect(recomputeInputSize, [recomputeInputSize]);

    useLayoutEffect(() => {
        if (inputRef.current) {
            const input = inputRef.current;
            const currentHeight = input.scrollHeight;

            if (!inputOriginHeight.current || maxRows === undefined) {
                input.style.marginRight = `${input.scrollWidth - input.offsetWidth}px`;
            }

            inputOriginHeight.current ||= currentHeight;
            inputLineHeight.current ||= parseInt(getComputedStyle(input).lineHeight, 10) || 0;
            input.rows = Math.min(maxRows ?? Infinity, Math.floor((currentHeight - inputOriginHeight.current) / inputLineHeight.current) + 1);
        }
    }, [maxRows, lastUpdated]);

    return { inputRef, recomputeInputSize };
};

const TransactionRefundReference = () => {
    const { i18n } = useCoreContext();
    const { refundReference, updateRefundReference } = useTransactionDataContext();
    const [reference, setReference] = useState(refundReference ?? '');
    const [characters, setCharactersCount] = useState(reference.length);

    const inputNormalizer = useInputNormalizer(REFUND_REFERENCE_CHAR_LIMIT);

    const onInput = (evt: h.JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
        const textarea = evt.currentTarget;
        const selectionEnd = textarea.selectionEnd;
        const value = inputNormalizer(textarea.value);

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
                    {/*<textarea*/}
                    {/*    ref={inputRef}*/}
                    {/*    className={`adyen-pe-input ${TX_DATA_INPUT} ${TX_DATA_INPUT_TEXTAREA}`}*/}
                    {/*    id="refundReference"*/}
                    {/*    placeholder={i18n.get('refundReference.placeholder')}*/}
                    {/*    onInput={onInput}*/}
                    {/*    value={reference}*/}
                    {/*/>*/}
                    <TextArea
                        id="refundReference"
                        className={`${TX_DATA_INPUT} ${TX_DATA_INPUT_TEXTAREA}`}
                        placeholder={i18n.get('refundReference.placeholder')}
                        value={reference}
                        onInput={onInput}
                        maxRows={4}
                    />
                </label>
            </div>
        </div>
    );
};

export default TransactionRefundReference;
