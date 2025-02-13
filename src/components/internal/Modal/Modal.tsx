import { useClickOutside } from '../../../hooks/element/useClickOutside';
import { containerQueries, useResponsiveViewport } from '../../../hooks/useResponsiveViewport';
import Button from '../Button';
import Icon from '../Icon';
import { ButtonVariant } from '../Button/types';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useCallback, useContext, useEffect } from 'preact/hooks';
import { createContext, Ref } from 'preact';
import cx from 'classnames';
import './Modal.scss';
import { ModalProps } from './types';

const ModalContext = createContext({ withinModal: false });

export const useModalContext = () => useContext(ModalContext);

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
    const isSmViewport = useResponsiveViewport(containerQueries.down.xs);
    const { i18n } = useCoreContext();
    const targetElement = useClickOutside(null, onClose) as Ref<HTMLDivElement>;

    const handleEscKey = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && isDismissible) {
                onClose();
            }
        },
        [isOpen, isDismissible, onClose]
    );

    useEffect(() => {
        if (isOpen) {
            window.addEventListener('keydown', handleEscKey);
        } else {
            window.removeEventListener('keydown', handleEscKey);
        }
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, handleEscKey]);

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
                    <ModalContext.Provider value={{ withinModal: true }}>
                        <div
                            className={cx('adyen-pe-modal', {
                                'adyen-pe-modal--fluid': size === 'fluid',
                                'adyen-pe-modal--small': size === 'small',
                                'adyen-pe-modal--large': size === 'large',
                                'adyen-pe-modal--extra-large': size === 'extra-large',
                                'adyen-pe-modal--full-screen': size === 'full-screen' || isSmViewport,
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
                                        <Icon name="cross" />
                                    </Button>
                                )}
                            </div>
                            <div className={'adyen-pe-modal__content'}>{children}</div>
                        </div>
                    </ModalContext.Provider>
                </div>
            )}
        </>
    );
}
