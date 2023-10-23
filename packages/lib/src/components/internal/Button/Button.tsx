import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import getModifierClasses from '@src/utils/get-modifier-classes';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import './Button.scss';
import { ButtonProps } from './types';

function Button(
    {
        variant = 'primary',
        disabled = false,
        onClick,
        classNameModifiers = [],
        iconLeft,
        iconRight,
        type = 'button',
        tabIndex,
        children,
        key,
        ariaAttributes,
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const clickAction = (e: any) => {
        e.preventDefault();

        if (!disabled) {
            onClick?.(e);
        }
    };

    const modifiers = [...classNameModifiers, ...[variant]];

    const buttonClasses = getModifierClasses('adyen-fp-button', modifiers, 'adyen-fp-button');

    return (
        <button
            className={buttonClasses}
            type={type}
            key={key}
            disabled={disabled}
            onClick={clickAction}
            tabIndex={tabIndex}
            ref={ref}
            role={'button'}
            aria-controls={ariaAttributes?.['aria-controls']}
            aria-expanded={ariaAttributes?.['aria-expended']}
        >
            {iconLeft && <span className="adyen-fp-button__icon-left">{iconLeft}</span>}
            <Typography className={'adyen-fp-button__label'} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
            {iconRight && <span className="adyen-fp-button__icon-right">{iconRight}</span>}
        </button>
    );
}

export default forwardRef(Button);
