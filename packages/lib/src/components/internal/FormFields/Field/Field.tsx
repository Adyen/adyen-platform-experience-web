import classNames from 'classnames';
import { cloneElement, ComponentChild, FunctionalComponent, h, toChildArray, VNode } from 'preact';
import { isFunction } from '@src/utils/common';
import { isString } from '@src/utils/validator-utils';
import Spinner from '../../Spinner';
import Icon from '../../Icon';
import { ARIA_ERROR_SUFFIX } from '../../../../core/Errors/constants';
import { useCallback, useRef, useState } from 'preact/hooks';
import { getUniqueId } from '../../../../utils/idGenerator';
import { FieldProps } from './types';
import './Field.scss';

const Field: FunctionalComponent<FieldProps> = props => {
    //
    const {
        children,
        className = '',
        classNameModifiers = [],
        dir,
        disabled,
        errorMessage,
        helper,
        inputWrapperModifiers = [],
        isCollatingErrors,
        isLoading,
        isValid,
        label,
        labelEndAdornment,
        name,
        onBlur,
        onFieldBlur,
        onFocus,
        onFocusField,
        showValidIcon,
        useLabelElement = true,
        // Redeclare prop names to avoid internal clashes
        filled: propsFilled,
        focused: propsFocused,
        i18n,
    } = props;

    const uniqueId = useRef(getUniqueId(`adyen-fp-${name}`));

    const [focused, setFocused] = useState(false);
    const [filled, setFilled] = useState(false);

    // The means by which focussed/filled is set for securedFields
    if (propsFocused != null) setFocused(!!propsFocused);
    if (propsFilled != null) setFilled(!!propsFilled);

    // The means by which focussed/filled is set for other fields - this function is passed down to them and triggered
    const onFocusHandler = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setFocused(true);
            onFocus?.(event);
        },
        [onFocus]
    );

    const onBlurHandler = useCallback(
        (event: h.JSX.TargetedEvent<HTMLInputElement>) => {
            setFocused(false);
            onBlur?.(event);
            // When we also need to fire a specific function when a field blurs
            onFieldBlur?.(event);
        },
        [onBlur, onFieldBlur]
    );

    const renderContent = useCallback(() => {
        return (
            <>
                {isString(label) && (
                    <span
                        className={classNames({
                            'adyen-fp-label__text': true,
                            'adyen-fp-label__text--error': errorMessage,
                        })}
                    >
                        {label}
                    </span>
                )}

                {isFunction(label) && label()}

                {labelEndAdornment && <span className="adyen-fp-label-adornment--end">{labelEndAdornment}</span>}

                {helper && <span className={'adyen-fp-helper-text'}>{helper}</span>}
                <div className={classNames(['adyen-fp-input-wrapper', ...inputWrapperModifiers.map(m => `adyen-fp-input-wrapper--${m}`)])} dir={dir}>
                    {toChildArray(children).map((child: ComponentChild): ComponentChild => {
                        const childProps = {
                            isValid,
                            onFocusHandler,
                            onBlurHandler,
                            isInvalid: !!errorMessage,
                            ...(name && { uniqueId: uniqueId.current }),
                        };
                        return cloneElement(child as VNode, childProps);
                    })}

                    {isLoading && (
                        <span className="adyen-fp-input__inline-validation adyen-fp-input__inline-validation--loading">
                            <Spinner size="small" />
                        </span>
                    )}

                    {isValid && showValidIcon !== false && (
                        <span className="adyen-fp-input__inline-validation adyen-fp-input__inline-validation--valid">
                            <Icon type="checkmark" alt={i18n?.get('field.valid')} />
                        </span>
                    )}

                    {errorMessage && (
                        <span className="adyen-fp-input__inline-validation adyen-fp-input__inline-validation--invalid">
                            <Icon type="field_error" alt={i18n?.get('field.invalid')} />
                        </span>
                    )}
                </div>
                {errorMessage && isString(errorMessage) && errorMessage.length && (
                    <span
                        className={'adyen-fp-error-text'}
                        id={`${uniqueId.current}${ARIA_ERROR_SUFFIX}`}
                        aria-hidden={isCollatingErrors ? 'true' : undefined}
                        aria-live={isCollatingErrors ? undefined : 'polite'}
                    >
                        {errorMessage}
                    </span>
                )}
            </>
        );
    }, [children, errorMessage, isLoading, isValid, label, onFocusHandler, onBlurHandler]);

    const LabelOrDiv = useCallback(
        ({ onFocusField, focused, filled, disabled, name, uniqueId, useLabelElement, children }: FieldProps & { uniqueId: string }) => {
            const defaultWrapperProps = {
                onClick: onFocusField,
                className: classNames({
                    'adyen-fp-label': true,
                    'adyen-fp-label--focused': focused,
                    'adyen-fp-label--filled': filled,
                    'adyen-fp-label--disabled': disabled,
                }),
            };

            return useLabelElement ? (
                <label {...defaultWrapperProps} htmlFor={name && uniqueId}>
                    {children}
                </label>
            ) : (
                <div {...defaultWrapperProps} role={'form'}>
                    {children}
                </div>
            );
        },
        []
    );

    /**
     * RENDER
     */
    return (
        <div
            className={classNames(
                'adyen-fp-field',
                className,
                classNameModifiers.map(m => `adyen-fp-field--${m}`),
                {
                    'adyen-fp-field--error': errorMessage,
                    'adyen-fp-field--valid': isValid,
                }
            )}
        >
            <LabelOrDiv
                onFocusField={onFocusField}
                name={name}
                disabled={disabled}
                filled={filled}
                focused={focused}
                useLabelElement={useLabelElement}
                uniqueId={uniqueId.current}
            >
                {renderContent()}
            </LabelOrDiv>
        </div>
    );
};
export default Field;
