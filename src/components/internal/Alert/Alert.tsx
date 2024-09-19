import cx from 'classnames';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Close from '../SVGIcons/Close';
import WarningFilled from '../SVGIcons/WarningFilled';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import { AlertProps } from './types';
import './Alert.scss';

function Alert({ className, description, title, type, onClose, isOpen }: AlertProps) {
    return (
        <>
            {isOpen && (
                <div className={cx('adyen-pe-alert', className)} role={'alert'}>
                    <div className={`adyen-pe-alert__inner-container adyen-pe-alert--${type}`}>
                        <div className={'adyen-pe-alert__icon'}>
                            <WarningFilled />
                        </div>
                        <div className={'adyen-pe-alert__content'}>
                            {title && (
                                <Typography
                                    className={'adyen-pe-alert__title'}
                                    el={TypographyElement.DIV}
                                    variant={TypographyVariant.BODY}
                                    wide
                                    strongest
                                >
                                    {title}
                                </Typography>
                            )}
                            {description && (
                                <Typography
                                    className={'adyen-pe-alert__description'}
                                    el={TypographyElement.DIV}
                                    variant={TypographyVariant.BODY}
                                    wide
                                >
                                    {description}
                                </Typography>
                            )}
                        </div>
                        <div className="adyen-pe-alert__close-button">
                            <Button iconButton variant={ButtonVariant.TERTIARY} onClick={onClose}>
                                <Close width={7.12} height={7.12} />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Alert;
