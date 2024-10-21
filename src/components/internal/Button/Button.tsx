import useButton from './hooks/useButton';
import {
    DEFAULT_BUTTON_CLASSNAME,
    BUTTON_ICON_LEFT_CLASSNAME,
    BUTTON_ICON_RIGHT_CLASSNAME,
    BUTTON_LABEL_CLASSNAME,
    ICON_BUTTON_CLASSNAME,
    ICON_BUTTON_CONTENT_CLASSNAME,
    BUTTON_FULL_WIDTH_CLASSNAME,
    BUTTON_CONDENSED_CLASSNAME,
} from './constants';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { fixedForwardRef, parseBooleanProp, parseClassName } from '../../../utils/preact';
import { Ref } from 'preact';
import { useMemo } from 'preact/hooks';
import { ButtonProps, ButtonVariant } from './types';
import './Button.scss';
import cx from 'classnames';

// TODO: Reuse BaseButton component within Button component
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
        fullWidth,
        condensed,
        ...restAttributes
    }: ButtonProps,
    ref: Ref<HTMLButtonElement>
) {
    const classNameValue = useMemo(() => parseClassName('', className) || '', [className]);
    const disabledValue = useMemo(() => parseBooleanProp(disabled), [disabled]);

    const { classes, click } = useButton(classNameValue, [...classNameModifiers, variant], DEFAULT_BUTTON_CLASSNAME, disabledValue, onClick);

    return (
        <button
            className={cx(classes, {
                [ICON_BUTTON_CLASSNAME]: iconButton,
                [BUTTON_CONDENSED_CLASSNAME]: condensed,
                [BUTTON_FULL_WIDTH_CLASSNAME]: fullWidth,
            })}
            type={type}
            disabled={disabled}
            onClick={click}
            ref={ref}
            {...restAttributes}
        >
            {iconButton ? (
                <div className={`${ICON_BUTTON_CONTENT_CLASSNAME}`}>{children}</div>
            ) : (
                <>
                    {iconLeft && <span className={BUTTON_ICON_LEFT_CLASSNAME}>{iconLeft}</span>}
                    <Typography className={BUTTON_LABEL_CLASSNAME} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                        {children}
                    </Typography>
                    {iconRight && <span className={BUTTON_ICON_RIGHT_CLASSNAME}>{iconRight}</span>}
                </>
            )}
        </button>
    );
}

export default fixedForwardRef(Button);
