import { useCallback, useMemo } from 'preact/hooks';
import {
    DEFAULT_BUTTON_CLASSNAME,
    BUTTON_ICON_LEFT_CLASSNAME,
    BUTTON_ICON_RIGHT_CLASSNAME,
    BUTTON_LABEL_CLASSNAME,
} from '@src/components/internal/Button/constants';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import getModifierClasses from '@src/utils/get-modifier-classes';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { ButtonProps, ButtonVariant } from './types';
import './Button.scss';

function Button(
    {
        variant = ButtonVariant.PRIMARY,
        disabled = false,
        onClick,
        classNameModifiers = [],
        iconLeft,
        iconRight,
        type = 'button',
        tabIndex,
        children,
        key,
        className,
        ...restAttributes
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const clickAction = useCallback(
        (e: any) => {
            e.preventDefault();

            if (!disabled) {
                onClick?.(e);
            }
        },
        [disabled, onClick]
    );

    const buttonClasses = useMemo(
        () => getModifierClasses(DEFAULT_BUTTON_CLASSNAME, [...classNameModifiers, variant], [DEFAULT_BUTTON_CLASSNAME, className]),
        [className, classNameModifiers, variant]
    );

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
            {...restAttributes}
        >
            {iconLeft && <span className={BUTTON_ICON_LEFT_CLASSNAME}>{iconLeft}</span>}
            <Typography className={BUTTON_LABEL_CLASSNAME} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {children}
            </Typography>
            {iconRight && <span className={BUTTON_ICON_RIGHT_CLASSNAME}>{iconRight}</span>}
        </button>
    );
}

export default forwardRef(Button);
