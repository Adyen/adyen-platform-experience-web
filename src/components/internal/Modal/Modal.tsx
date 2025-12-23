import { ButtonVariant } from '../Button/types';
import { useClickOutside } from '../../../hooks/element/useClickOutside';
import { containerQueries, useResponsiveContainer } from '../../../hooks/useResponsiveContainer';
import tabbable from '../../../primitives/dom/tabbableRoot/tabbable';
import useFocusTrap from '../../../hooks/element/useFocusTrap';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useCallback, useContext, useEffect, useRef } from 'preact/hooks';
import { createContext } from 'preact';
import { ModalProps } from './types';
import Button from '../Button';
import Icon from '../Icon';
import cx from 'classnames';
import './Modal.scss';

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
    const { i18n } = useCoreContext();
    const isSmContainer = useResponsiveContainer(containerQueries.down.xs);
    const focusCaptureElement = useRef<HTMLDivElement | null>(null);
    const focusRestoreElement = useRef<Element | null>(null);

    const handleDismiss = useCallback(() => {
        if (isOpen && isDismissible) {
            (focusRestoreElement.current as HTMLElement)?.focus();
            onClose();
        }
    }, [isOpen, isDismissible, onClose]);

    const modalRootElement = useFocusTrap<HTMLDivElement>(useClickOutside(null, handleDismiss), handleDismiss);

    useEffect(() => {
        if (isOpen && modalRootElement.current) {
            focusRestoreElement.current = document.activeElement;
            let tabbableHandle = tabbable();

            // Temporarily focus on the capture element, so that
            // focus is contained within the modal root element.
            focusCaptureElement.current?.focus();

            // Set the modal root element as the tabbable root.
            // And then activate focus on the first tabbable element.
            tabbableHandle.root = modalRootElement.current;
            tabbableHandle.current = 1;

            // Focus capture element no longer needed
            focusCaptureElement.current?.remove();

            return () => {
                tabbableHandle.root = null;
                tabbableHandle = null!;
            };
        }
    }, [isOpen]);

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
                    aria-hidden="false"
                    {...props}
                >
                    <ModalContext.Provider value={{ withinModal: true }}>
                        <div
                            className={cx('adyen-pe-modal', {
                                'adyen-pe-modal--fluid': size === 'fluid',
                                'adyen-pe-modal--small': size === 'small',
                                'adyen-pe-modal--large': size === 'large',
                                'adyen-pe-modal--extra-large': size === 'extra-large',
                                'adyen-pe-modal--full-screen': size === 'full-screen' || isSmContainer,
                            })}
                            ref={modalRootElement}
                        >
                            <div className="adyen-pe-visually-hidden" ref={focusCaptureElement} tabIndex={-1}></div>
                            <div
                                className={cx('adyen-pe-modal__header', {
                                    'adyen-pe-modal__header--with-title': title,
                                    'adyen-pe-modal__header--with-border-bottom': headerWithBorder,
                                })}
                            >
                                {title && <div className={`adyen-pe-modal__header-title`}>{title}</div>}

                                {isDismissible && (
                                    <Button
                                        onClick={handleDismiss}
                                        variant={ButtonVariant.TERTIARY}
                                        iconButton
                                        classNameModifiers={['circle']}
                                        className={`adyen-pe-modal__dismiss-button`}
                                        aria-label={i18n.get('common.modal.controls.dismiss.label')}
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
