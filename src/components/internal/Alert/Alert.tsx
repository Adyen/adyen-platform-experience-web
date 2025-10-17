import cx from 'classnames';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Icon from '../Icon';
import useCoreContext from '../../../core/Context/useCoreContext';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { AlertIcon } from './AlertIcon';
import { AlertProps, AlertVariantOption } from './types';
import './Alert.scss';

export const Alert = ({ className, description, title, type, children, onClose, variant = AlertVariantOption.DEFAULT }: AlertProps) => {
    const { i18n } = useCoreContext();
    return (
        <div className={cx('adyen-pe-alert', `adyen-pe-alert--${type}`, `adyen-pe-alert--${variant}`, className)} role="alert">
            <AlertIcon type={type} className="adyen-pe-alert__icon" />
            <div className={'adyen-pe-alert__content'}>
                {title && variant !== AlertVariantOption.TIP && (
                    <Typography className={'adyen-pe-alert__title'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide strongest>
                        {title}
                    </Typography>
                )}
                {description && (
                    <Typography
                        className={'adyen-pe-alert__description'}
                        el={TypographyElement.DIV}
                        variant={variant !== AlertVariantOption.TIP ? TypographyVariant.CAPTION : TypographyVariant.BODY}
                        wide
                    >
                        {description}
                    </Typography>
                )}
                {children}
            </div>
            {onClose && variant !== AlertVariantOption.TIP && (
                <div className="adyen-pe-alert__close-button">
                    <Button
                        iconButton
                        variant={ButtonVariant.TERTIARY}
                        onClick={onClose}
                        aria-label={i18n.get('common.actions.dismiss.labels.dismiss')}
                    >
                        <Icon name="cross" />
                    </Button>
                </div>
            )}
        </div>
    );
};

export default Alert;
