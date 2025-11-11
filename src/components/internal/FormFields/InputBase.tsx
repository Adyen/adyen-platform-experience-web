import { ARIA_ERROR_SUFFIX } from '../../../core/Errors/constants';
import { hasOwnProperty } from '../../../utils';
import classNames from 'classnames';
import { h } from 'preact';
import { ForwardedRef, forwardRef, TargetedEvent } from 'preact/compat';
import { useCallback } from 'preact/hooks';
import { InputBaseProps } from './types';
import Select from './Select';
import './FormFields.scss';
import { ButtonVariant } from '../Button/types';

function InputBase(
    {
        onInput,
        onKeyUp,
        trimOnBlur,
        onBlurHandler,
        onBlur,
        onFocusHandler,
        errorMessage,
        iconBefore,
        iconAfter,
        iconBeforeInteractive,
        iconAfterInteractive,
        dropdown,
        dropdownPosition = 'start',
        onDropdownInput,
        onUpdateDropdown,
        ...props
    }: InputBaseProps,
    ref: ForwardedRef<HTMLInputElement | null>
) {
    const { classNameModifiers, isInvalid, isValid, readonly = false, type, uniqueId, isCollatingErrors, disabled } = props;

    /**
     * To avoid confusion with misplaced/misdirected onChange handlers - InputBase only accepts onInput, onBlur & onFocus handlers.
     * The first 2 being the means by which we expect useForm--handleChangeFor validation functionality to be applied.
     */
    if (hasOwnProperty(props, 'onChange')) {
        console.error('Error: Form fields that rely on InputBase may not have an onChange property');
    }

    const handleInput = useCallback(
        (event: TargetedEvent<HTMLInputElement, Event>) => {
            onInput?.(event);
        },
        [onInput]
    );

    const handleKeyUp = useCallback(
        (event: h.JSX.TargetedKeyboardEvent<HTMLInputElement>) => {
            if (onKeyUp) onKeyUp(event);
        },
        [onKeyUp]
    );

    const handleBlur = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            onBlurHandler?.(event); // From Field component

            if (trimOnBlur) {
                (event.target as HTMLInputElement).value = (event.target as HTMLInputElement).value.trim(); // needed to trim trailing spaces in field (leading spaces can be done via formatting)
            }

            onBlur?.(event);
        },
        [onBlur, onBlurHandler, trimOnBlur]
    );

    const handleFocus = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            onFocusHandler?.(event); // From Field component
        },
        [onFocusHandler]
    );

    const handleDropdownChange = useCallback(
        (event: any) => {
            const selectedValue = event.target?.value;
            onDropdownInput?.(selectedValue);
            if (dropdown) {
                onUpdateDropdown?.({ ...dropdown, value: selectedValue });
            }
        },
        [dropdown, onDropdownInput, onUpdateDropdown]
    );

    const inputClassNames = classNames(
        'adyen-pe-input',
        [`adyen-pe-input--${type}`],
        props.className,
        {
            'adyen-pe-input--invalid': isInvalid,
            'adyen-pe-input--valid': isValid,
        },
        classNameModifiers?.map(m => `adyen-pe-input--${m}`)
    );

    // Don't spread classNameModifiers etc to input element (it ends up as an attribute on the element itself)
    const {
        classNameModifiers: cnm,
        uniqueId: uid,
        isInvalid: iiv,
        isValid: iv,
        isCollatingErrors: ce,
        autoFocus,
        autofocus,
        ...newProps
    } = props as any;

    const hasIcons = iconBefore || iconAfter;
    const shouldShowDropdown = !!dropdown && dropdown.items.length > 0;
    const shouldDisplayDropdownAtStart = shouldShowDropdown && dropdownPosition === 'start';
    const shouldDisplayDropdownAtEnd = shouldShowDropdown && dropdownPosition === 'end';
    const hasDropdownOrIcons = hasIcons || shouldShowDropdown;

    const isDropdownReadOnly = readonly || dropdown?.readonly;

    const inputElement = (
        <input
            id={uniqueId}
            {...newProps}
            type={type}
            className={inputClassNames}
            readOnly={readonly}
            aria-describedby={isCollatingErrors ? undefined : `${uniqueId}${ARIA_ERROR_SUFFIX}`}
            aria-invalid={isInvalid}
            onInput={handleInput}
            onBlurCapture={handleBlur}
            onFocus={handleFocus}
            onKeyUp={handleKeyUp}
            disabled={disabled}
            ref={ref}
            autoFocus={false}
        />
    );

    return (
        <>
            {hasDropdownOrIcons ? (
                <div className="adyen-pe-input__container">
                    {shouldDisplayDropdownAtStart && dropdown && (
                        <div role="presentation" className="adyen-pe-input__dropdown adyen-pe-input__dropdown--start">
                            <Select
                                buttonVariant={ButtonVariant.TERTIARY}
                                items={dropdown.items}
                                selected={dropdown.value}
                                onChange={handleDropdownChange}
                                readonly={isDropdownReadOnly}
                                filterable={dropdown.dynamicFiltering}
                                aria-label={dropdown['aria-label']}
                                classNameModifiers={['input-field']}
                                isInvalid={isInvalid}
                                isValid={isValid}
                                isCollatingErrors={isCollatingErrors}
                                disableToggleFocusOnClose
                            />
                        </div>
                    )}
                    {iconBefore && (
                        <span
                            className={classNames('adyen-pe-input__icon-before', {
                                'adyen-pe-input__icon-before--interactive': iconBeforeInteractive,
                            })}
                            {...(!iconBeforeInteractive && { 'aria-hidden': 'true' })}
                        >
                            {iconBefore}
                        </span>
                    )}
                    {inputElement}
                    {iconAfter && (
                        <span
                            className={classNames('adyen-pe-input__icon-after', {
                                'adyen-pe-input__icon-after--interactive': iconAfterInteractive,
                            })}
                            {...(!iconAfterInteractive && { 'aria-hidden': 'true' })}
                        >
                            {iconAfter}
                        </span>
                    )}
                    {shouldDisplayDropdownAtEnd && dropdown && (
                        <div
                            role="presentation"
                            className="adyen-pe-input__dropdown adyen-pe-input__dropdown--end"
                            onClickCapture={e => e.stopPropagation()}
                            onMouseDownCapture={e => e.stopPropagation()}
                        >
                            <Select
                                items={dropdown.items}
                                selected={dropdown.value}
                                onChange={handleDropdownChange}
                                readonly={isDropdownReadOnly}
                                filterable={dropdown.dynamicFiltering}
                                aria-label={dropdown['aria-label']}
                                classNameModifiers={['input-field']}
                                isInvalid={isInvalid}
                                isValid={isValid}
                                isCollatingErrors={isCollatingErrors}
                            />
                        </div>
                    )}
                </div>
            ) : (
                inputElement
            )}
            {isInvalid && errorMessage && (
                <span className="adyen-pe-input__invalid-value" id={`${uniqueId}${ARIA_ERROR_SUFFIX}`}>
                    {errorMessage}
                </span>
            )}
        </>
    );
}

InputBase.defaultProps = {
    type: 'text',
    classNameModifiers: [],
    onInput: () => {},
};

export default forwardRef(InputBase);
