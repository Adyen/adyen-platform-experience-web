import { useClickOutside } from '../../../hooks/element/useClickOutside';
import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Close from '../SVGIcons/Close';
import useCoreContext from '../../../core/Context/useCoreContext';
import { Ref } from 'preact/hooks';
import cx from 'classnames';
import './Modal.scss';
import { ModalProps } from './types';

export default function Modal({
    title,
    children,
    classNameModifiers = [],
    isOpen,
    onClose,
    isDismissible = true,
    headerWithBorder = true,
    size = 'fluid',
    ...props
}: ModalProps) {
    const { i18n } = useCoreContext();
    const targetElement = useClickOutside(null, onClose) as Ref<HTMLDivElement | null>;

    return (
        <>
            {isOpen && (
                <div
                    className={cx(
                        'adyen-pe-modal-wrapper',
                        classNameModifiers.map(m => `adyen-pe-modal-wrapper--${m}`),
                        { 'adyen-pe-modal-wrapper--open': isOpen, 'adyen-pe-modal-wrapper--dismissible': isDismissible }
                    )}
                    role="dialog"
                    aria-modal="true"
                    aria-hidden={!open}
                    {...props}
                >
                    <div
                        className={cx('adyen-pe-modal', {
                            'adyen-pe-modal--fluid': size === 'fluid',
                            'adyen-pe-modal--small': size === 'small',
                            'adyen-pe-modal--large': size === 'large',
                            'adyen-pe-modal--extra-large': size === 'extra-large',
                            'adyen-pe-modal--full-screen': size === 'full-screen',
                        })}
                        ref={targetElement}
                    >
                        <div
                            className={cx('adyen-pe-modal__header', {
                                'adyen-pe-modal__header--with-title': title,
                                'adyen-pe-modal__header--with-border-bottom': headerWithBorder,
                            })}
                        >
                            {title && <div className={`adyen-pe-modal__header__title`}>{title}</div>}

                            {isDismissible && (
                                <Button
                                    onClick={onClose}
                                    variant={ButtonVariant.TERTIARY}
                                    iconButton
                                    classNameModifiers={['circle']}
                                    className={`adyen-pe-modal__header-icon`}
                                    aria-label={i18n.get('dismiss')}
                                >
                                    <Close />
                                </Button>
                            )}
                        </div>
                        <div className={'adyen-pe-modal__content'}>{children}</div>
                    </div>
                </div>
            )}
        </>
    );
}
