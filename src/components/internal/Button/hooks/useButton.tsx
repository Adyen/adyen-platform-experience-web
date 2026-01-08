import { getModifierClasses } from '../../../../utils/preact';
import { useCallback, useMemo } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import cx from 'classnames';
import {
    BUTTON_LABEL_CENTERED_CLASSNAME,
    BUTTON_CONDENSED_CLASSNAME,
    BUTTON_FULL_WIDTH_CLASSNAME,
    BUTTON_ICON_LEFT_CLASSNAME,
    BUTTON_ICON_RIGHT_CLASSNAME,
    BUTTON_LABEL_CLASSNAME,
    BUTTON_LOADING_CLASSNAME,
    ICON_BUTTON_CLASSNAME,
    ICON_BUTTON_CONTENT_CLASSNAME,
} from '../constants';
import Spinner from '../../Spinner';
import Typography from '../../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../../Typography/types';
import { BaseButtonProps, RegularButtonProps } from '../types';
import { PropsWithChildren } from 'preact/compat';

const useButton = (
    className: string,
    classNameModifiers: string[],
    defaultClassName: string,
    disabled: boolean,
    props: PropsWithChildren<BaseButtonProps>,
    type: RegularButtonProps['type'],
    onClick?: JSXInternal.MouseEventHandler<HTMLButtonElement> | JSXInternal.MouseEventHandler<HTMLAnchorElement>
) => {
    const { children, iconLeft, iconRight, iconButton = false, fullWidth, condensed, state = 'default' } = props;

    const click = useCallback(
        (e: any) => {
            // Only prevent default for non-submit buttons
            // Submit buttons should trigger form submission naturally
            if (type !== 'submit') {
                e.preventDefault();
            }

            if (!disabled) {
                onClick?.(e);
            }
        },
        [disabled, onClick, type]
    );

    const classes = useMemo(
        () => getModifierClasses(defaultClassName, classNameModifiers, [defaultClassName, className]),
        [defaultClassName, classNameModifiers, className]
    );

    const allProps = useMemo(
        () => ({
            ...props,
            className: cx(classes, {
                [ICON_BUTTON_CLASSNAME]: iconButton,
                [BUTTON_CONDENSED_CLASSNAME]: condensed,
                [BUTTON_FULL_WIDTH_CLASSNAME]: fullWidth,
                [BUTTON_LOADING_CLASSNAME]: state === 'loading',
            }),
            disabled: disabled || state === 'loading',
        }),
        [classes, condensed, disabled, fullWidth, iconButton, props, state]
    );

    const allChildren = useMemo(
        () =>
            iconButton ? (
                <div className={`${ICON_BUTTON_CONTENT_CLASSNAME}`}>{children}</div>
            ) : (
                <>
                    {state === 'loading' && <Spinner size={'x-small'} />}
                    {iconLeft && <span className={BUTTON_ICON_LEFT_CLASSNAME}>{iconLeft}</span>}
                    <Typography
                        className={cx(BUTTON_LABEL_CLASSNAME, {
                            [BUTTON_LABEL_CENTERED_CLASSNAME]: props.align === 'center',
                        })}
                        el={TypographyElement.SPAN}
                        variant={TypographyVariant.BODY}
                    >
                        {children}
                    </Typography>
                    {iconRight && <span className={BUTTON_ICON_RIGHT_CLASSNAME}>{iconRight}</span>}
                </>
            ),
        [children, iconButton, iconLeft, iconRight, props.align, state]
    );

    return { classes, click, allChildren, allProps };
};

export default useButton;
