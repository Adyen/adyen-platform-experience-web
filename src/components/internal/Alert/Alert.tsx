import cx from 'classnames';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Icon from '../Icon';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { AlertIcon } from './AlertIcon';
import { AlertProps, AlertTypeOption } from './types';
import './Alert.scss';

export const Alert = ({ className, description, title, type, children, onClose }: AlertProps) => (
    <div
        className={cx('adyen-pe-alert', `adyen-pe-alert--${type === AlertTypeOption.IN_PROGRESS ? AlertTypeOption.HIGHLIGHT : type}`, className)}
        role="alert"
    >
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
