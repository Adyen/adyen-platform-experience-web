import Button from '../Button';
import { ButtonVariant } from '../Button/types';
import Close from '../SVGIcons/Close';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useCallback, useEffect, useRef } from 'preact/hooks';
import cx from 'classnames';
import { TargetedEvent } from 'preact/compat';
import './Modal.scss';
import { ModalProps } from './types';

function targetIsNode(e: EventTarget | null): e is Node {
    if (!e || !('nodeType' in e)) {
        return false;
    }
    return true;
}
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
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const { i18n } = useCoreContext();
    const handleClickOutside = useCallback(
        (e: TargetedEvent<Node, MouseEvent>) => {
            if (isDismissible && isOpen && targetIsNode(e.target) && !modalContainerRef?.current?.contains(e.target)) {
                onClose();
            }
        },
        [isDismissible, isOpen, onClose]
    );

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
                    onClick={handleClickOutside}
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
                        ref={modalContainerRef}
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
