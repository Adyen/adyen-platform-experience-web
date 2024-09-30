import cx from 'classnames';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { AlertProps } from './types';
import './Alert.scss';
import Icon from '../Icon';
import { AlertIcon } from './AlertIcon';

export const Alert = ({ className, description, title, type, children, onClose }: AlertProps) => (
    <div className={cx('adyen-pe-alert', `adyen-pe-alert--${type}`, className)} role="alert">
        <AlertIcon type={type} className="adyen-pe-alert__icon" />
        <div className={'adyen-pe-alert__content'}>
            {title && (
                <Typography className={'adyen-pe-alert__title'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide strongest>
                    {title}
                </Typography>
            )}
            {description && (
                <Typography className={'adyen-pe-alert__description'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide>
                    {description}
                </Typography>
            )}
            {children}
        </div>
        {onClose && (
            <div className="adyen-pe-alert__close-button">
                <Button iconButton variant={ButtonVariant.TERTIARY} onClick={onClose}>
                    <Icon name="cross" />
                </Button>
            </div>
        )}
    </div>
);

export default Alert;
