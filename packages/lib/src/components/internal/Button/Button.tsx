import { Component } from 'preact';
import classNames from 'classnames';
import Spinner from '../Spinner';
import useCoreContext from '../../../core/Context/useCoreContext';
import './Button.scss';
import { ButtonProps, ButtonState, ButtonStatus } from './types';

class Button extends Component<ButtonProps, ButtonState> {
    public static defaultProps = {
        status: 'default',
        variant: 'primary',
        disabled: false,
        label: '',
        inline: false,
        target: '_self',
        onClick: () => {},
    };

    public onClick = (e: any) => {
        e.preventDefault();

        if (!this.props.disabled) {
            this.props.onClick?.(e, { complete: this.complete });
        }
    };

    public complete = (delay = 1000) => {
        this.setState({ completed: true });
        setTimeout(() => {
            this.setState({ completed: false });
        }, delay);
    };

    render(
        { classNameModifiers = [], disabled, href, icon, inline, label, status, tabIndex, variant }: ButtonProps,
        { completed }: { completed: boolean }
    ) {
        const { i18n } = useCoreContext();

        const buttonIcon = icon ? <img className="adyen-fp-button__icon" src={icon} alt="" aria-hidden="true" /> : '';

        const modifiers = [
            ...classNameModifiers,
            ...(variant !== 'primary' ? [variant] : []),
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
                <span className="adyen-fp-button__content">
                    {buttonIcon}
                    <span className="adyen-fp-button__text">{label}</span>
                </span>
            ),
        };

        const buttonText = (status ? buttonStates[status] : undefined) || buttonStates.default;

        if (href) {
            return (
                <a className={buttonClasses} href={href} disabled={disabled} tabIndex={tabIndex} target={this.props.target} rel={this.props.rel}>
                    {buttonText}
                </a>
            );
        }

        return (
            <button className={buttonClasses} type="button" disabled={disabled} onClick={this.onClick} tabIndex={tabIndex}>
                {buttonText}
                {status !== 'loading' && status !== 'redirect' && this.props.children}
            </button>
        );
    }
}

export default Button;
