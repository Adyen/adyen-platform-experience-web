import { h } from 'preact';
import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { isUndefined } from '../../../utils';
import cx from 'classnames';
import './FormFields.scss';
import { TextareaHTMLAttributes } from 'preact/compat';

export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement> & { maxRows?: number }) => {
    const { className, maxRows, onInput, rows, ...externalProps } = props;
    const [lastUpdated, setLastUpdated] = useState(performance.now());
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const inputOriginHeight = useRef(0);
    const inputLineHeight = useRef(0);

    const autoResizable = !isUndefined(maxRows);

    const autoResizeOnInput = (evt: h.JSX.TargetedInputEvent<HTMLTextAreaElement>) => {
        onInput?.(evt);
        if (externalProps.value !== evt.currentTarget.value) {
            evt.currentTarget.rows = (rows as number) ?? 1;
            setLastUpdated(performance.now());
        }
    };

    useLayoutEffect(() => {
        if (inputRef.current) {
            const input = inputRef.current;

            input.rows = (rows as number) ?? 1;
            inputOriginHeight.current = 0;
            inputLineHeight.current = 0;
            input.style.marginRight = '';

            if (autoResizable) {
                inputOriginHeight.current = input.scrollHeight;
                inputLineHeight.current = parseInt(getComputedStyle(input).lineHeight, 10) || 0;
                input.style.marginRight = `${input.scrollWidth - input.offsetWidth}px`;
            }
        }
    }, [autoResizable, maxRows, rows]);

    useLayoutEffect(() => {
        if (inputRef.current && autoResizable) {
            const input = inputRef.current;
            const currentHeight = input.scrollHeight;
            input.rows = Math.min(maxRows ?? Infinity, Math.floor((currentHeight - inputOriginHeight.current) / inputLineHeight.current) + 1);
        }
    }, [autoResizable, lastUpdated, maxRows]);

    return (
        <div
            className={cx('adyen-pe-input-wrapper', {
                'adyen-pe-input-wrapper--autoresizable-textarea': autoResizable,
            })}
        >
            <textarea
                {...externalProps}
                {...(!autoResizable && { rows })}
                className={cx('adyen-pe-input', className)}
                onInput={autoResizable ? autoResizeOnInput : onInput}
                ref={inputRef}
            />
        </div>
    );
};

export default TextArea;
