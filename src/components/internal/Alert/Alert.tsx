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

//TODO: Revisit the closeButton prop which is adopted from Bento component
export const Alert = ({
    className,
    description,
    closeButton,
    title,
    type,
    children,
    onClose,
    actions,
    variant = AlertVariantOption.DEFAULT,
}: AlertProps) => {
    const { i18n } = useCoreContext();

    console.log(actions);
    console.log(!!actions?.length && actions?.length > 0);

    return (
        <div className={cx('adyen-pe-alert', `adyen-pe-alert--${type}`, `adyen-pe-alert--${variant}`, className)} role="alert">
            <AlertIcon type={type} className="adyen-pe-alert__icon" />
            <div className="adyen-pe-alert__content-container">
                <div className="adyen-pe-alert__content">
                    {title && variant !== AlertVariantOption.TIP && (
                        <Typography className={'adyen-pe-alert__title'} el={TypographyElement.DIV} variant={TypographyVariant.BODY} wide strongest>
                            {title}
                        </Typography>
                    )}
                    {description && (
                        <Typography
                            className={'adyen-pe-alert__description'}
                            el={TypographyElement.DIV}
                            variant={variant === AlertVariantOption.TIP ? TypographyVariant.CAPTION : TypographyVariant.BODY}
                            wide
                        >
                            {description}
                        </Typography>
                    )}
                    {children}
                </div>
                {!!actions?.length && (
                    <div className="adyen-pe-alert__actions">
                        {actions?.map((action, index) => (
                            <Button key={index} onClick={action.onClick} variant={ButtonVariant.TERTIARY}>
                                {action.label}
                            </Button>
                        ))}
                    </div>
                )}
            </div>
            {onClose && (variant !== AlertVariantOption.TIP || closeButton) && (
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
