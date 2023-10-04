import classNames from 'classnames';
import Spinner from '../Spinner';
import useCoreContext from '@src/core/Context/useCoreContext';
import './Button.scss';
import { ButtonProps, ButtonState, ButtonStatus } from './types';
import { useState } from 'preact/hooks';
import { forwardRef } from 'preact/compat';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyElement, TypographyVariant } from '@src/components/internal/Typography/types';
import { Ref } from 'preact';

function Button(
    {
        status = 'default',
        variant = 'primary',
        disabled = false,
        label = '',
        inline = false,
        target = '_self',
        onClick = () => {},
        classNameModifiers = [],
        href,
        icon,
        tabIndex,
        rel,
        children,
    }: ButtonProps & ButtonState,
    ref: Ref<HTMLButtonElement>
) {
    const [completed, setCompleted] = useState(false);

    const clickAction = (e: any) => {
        e.preventDefault();

        if (!disabled) {
            onClick?.(e, { complete: completeAction });
        }
    };

    const completeAction = (delay = 1000) => {
        setCompleted(true);
        setTimeout(() => {
            setCompleted(false);
        }, delay);
    };

    const { i18n } = useCoreContext();

    const buttonIcon = icon ? <img className="adyen-fp-button__icon" src={icon} alt="" aria-hidden="true" /> : '';

    const modifiers = [
        ...classNameModifiers,
        ...[variant],
        ...(inline ? ['inline'] : []),
        ...(completed ? ['completed'] : []),
        ...(status === 'loading' || status === 'redirect' ? ['loading'] : []),
    ];

    const buttonClasses = classNames(['adyen-fp-button', ...modifiers.map(m => `adyen-fp-button--${m}`)]);

    const buttonStates: { [k in ButtonStatus]: any } = {
        loading: <Spinner size="medium" />,
        redirect: (
            <span className="adyen-fp-button__content">
                <Spinner size="medium" inline />
                {i18n.get('payButton.redirecting')}
            </span>
        ),
        default: (
            <Typography className={'adyen-fp-button__label'} el={TypographyElement.SPAN} variant={TypographyVariant.BODY} stronger={true}>
                {buttonIcon}
                {label}
            </Typography>
        ),
    };

    const buttonText = (status ? buttonStates[status] : undefined) || buttonStates.default;

    if (href) {
        return (
            <a className={buttonClasses} href={href} disabled={disabled} tabIndex={tabIndex} target={target} rel={rel}>
                {buttonText}
            </a>
        );
    }

    return (
        <button className={buttonClasses} type="button" disabled={disabled} onClick={clickAction} tabIndex={tabIndex} ref={ref}>
            {buttonText}
            {status !== 'loading' && status !== 'redirect' && children}
        </button>
    );
}

export default forwardRef(Button);
