import { h } from 'preact';
import { useCallback } from 'preact/hooks';
import classNames from 'classnames';
import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';
import { InputBaseProps } from './types';
import { ForwardedRef, forwardRef, TargetedEvent } from 'preact/compat';

function InputBase(props: InputBaseProps, ref: ForwardedRef<HTMLInputElement | null>) {
    const { autoCorrect, classNameModifiers, isInvalid, isValid, readonly = false, spellCheck, type, uniqueId, isCollatingErrors, disabled } = props;

    /**
     * To avoid confusion with misplaced/misdirected onChange handlers - InputBase only accepts onInput, onBlur & onFocus handlers.
     * The first 2 being the means by which we expect useForm--handleChangeFor validation functionality to be applied.
     */
    if (Object.prototype.hasOwnProperty.call(props, 'onChange')) {
        console.error('Error: Form fields that rely on InputBase may not have an onChange property');
    }

    const handleInput = useCallback(
        (event: TargetedEvent<HTMLInputElement, Event>) => {
            props.onInput?.(event);
        },
        [props.onInput]
    );

    const handleKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (props?.onKeyUp) props.onKeyUp(event);
        },
        [props?.onKeyUp]
    );

    const handleBlur = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            props?.onBlurHandler?.(event); // From Field component

            if (props.trimOnBlur) {
                (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.trim(); // needed to trim trailing spaces in field (leading spaces can be done via formatting)
            }

            props?.onBlur?.(event);
        },
        [props.onBlur, props.onBlurHandler]
    );

    const handleFocus = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            props?.onFocusHandler?.(event); // From Field component
        },
        [props.onFocusHandler]
    );

    const inputClassNames = classNames(
        'adyen-fp-input',
        [`adyen-fp-input--${type}`],
        props.className,
        {
            'adyen-fp-input--invalid': isInvalid,
            'adyen-fp-input--valid': isValid,
        },
        classNameModifiers?.map(m => `adyen-fp-input--${m}`)
    );

    // Don't spread classNameModifiers etc to input element (it ends up as an attribute on the element itself)
    const { classNameModifiers: cnm, uniqueId: uid, isInvalid: iiv, isValid: iv, isCollatingErrors: ce, ...newProps } = props;

    return (
        <input
            id={uniqueId}
            {...newProps}
            type={type}
            className={inputClassNames}
            readOnly={readonly}
            spellCheck={spellCheck}
            autoCorrect={autoCorrect}
            aria-describedby={isCollatingErrors ? undefined : `${uniqueId}${ARIA_ERROR_SUFFIX}`}
            aria-invalid={isInvalid}
            onInput={handleInput}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            ref={ref}
        />
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: [],
    onInput: () => {},
};

export default forwardRef(InputBase);
