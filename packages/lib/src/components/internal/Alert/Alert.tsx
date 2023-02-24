import { ComponentChildren, h } from 'preact';
import cx from 'classnames';
import Icon from '../Icon';
import './Alert.scss';

const ALERT_TYPES = ['error', 'warning', 'success', 'info'];

interface AlertProps {
    children: ComponentChildren;
    classNames?: string[];
    icon?: string;
    type?: typeof ALERT_TYPES[number];
}

export default function Alert({ children, classNames = [], type = 'error', icon }: AlertProps) {
    return (
        <div className={cx('adyen-fp-alert-message', `adyen-fp-alert-message--${type}`, classNames)}>
            {icon && <Icon className={'adyen-fp-alert-message__icon'} type={icon} />}
            {children}
        </div>
    );
}
