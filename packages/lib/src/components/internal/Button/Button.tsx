import useButton from '@src/components/internal/Button/hooks/useButton';
import {
    DEFAULT_BUTTON_CLASSNAME,
    BUTTON_ICON_LEFT_CLASSNAME,
    BUTTON_ICON_RIGHT_CLASSNAME,
    BUTTON_LABEL_CLASSNAME,
} from '@src/components/internal/Button/constants';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import { parseClassName } from '@src/utils/class-name-utils';
import { parseBoolean } from '@src/utils/common';
import { Ref } from 'preact';
import { forwardRef } from 'preact/compat';
import { useMemo } from 'preact/hooks';
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
        children,
        className,
        iconButton = false,
        ...restAttributes
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBoolean(disabled), [disabled]);

    const { classes, click } = useButton(classNameValue, [...classNameModifiers, variant], DEFAULT_BUTTON_CLASSNAME, disabledValue, onClick);

    return (
        <button className={classes} type={type} disabled={disabled} onClick={click} ref={ref} {...restAttributes}>
            {iconLeft && <span className={BUTTON_ICON_LEFT_CLASSNAME}>{iconLeft}</span>}
            {iconButton ? (
                { children }
            ) : (
                <Typography className={BUTTON_LABEL_CLASSNAME} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                    {children}
                </Typography>
            )}
            {iconRight && <span className={BUTTON_ICON_RIGHT_CLASSNAME}>{iconRight}</span>}
        </button>
    );
}

export default forwardRef(Button);
