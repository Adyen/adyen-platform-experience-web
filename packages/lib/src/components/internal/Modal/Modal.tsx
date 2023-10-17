import { useEffect, useRef } from 'preact/hooks';
import cx from 'classnames';
import './Modal.scss';
import { ModalProps } from './types';
import { TargetedEvent } from 'preact/compat';
import useCoreContext from '@src/core/Context/useCoreContext';

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
}: ModalProps) {
    const modalContainerRef = useRef<HTMLDivElement>(null);
    const { i18n } = useCoreContext();
    const handleClickOutside = (e: TargetedEvent<Node, MouseEvent>) => {
        if (isDismissible && isOpen && targetIsNode(e.target) && !modalContainerRef?.current?.contains(e.target)) {
            onClose();
        }
    };

    const handleEscKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen && isDismissible) {
            onClose();
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen]);

    return (
        <div
            className={cx(
                'adyen-fp-modal-wrapper',
                classNameModifiers.map(m => `adyen-fp-modal-wrapper--${m}`),
                { 'adyen-fp-modal-wrapper--open': isOpen, 'adyen-fp-modal-wrapper--dismissible': isDismissible }
            )}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            aria-hidden={!open}
            onClick={handleClickOutside}
        >
            <div
                className={cx('adyen-fp-modal', {
                    'adyen-fp-modal--fluid': size === 'fluid',
                    'adyen-fp-modal--small': size === 'small',
                    'adyen-fp-modal--large': size === 'large',
                    'adyen-fp-modal--extra-large': size === 'extra-large',
                    'adyen-fp-modal--full-screen': size === 'full-screen',
                })}
                ref={modalContainerRef}
            >
                <div
                    className={cx('adyen-fp-modal__header', {
                        'adyen-fp-modal__header--with-border-bottom': headerWithBorder,
                    })}
                >
                    <div className={`adyen-fp-modal__header__title`}>{title}</div>

                    {isDismissible && (
                        <button onClick={onClose} className={`adyen-fp-modal__header-icon`} aria-label={i18n.get('dismiss')}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M13.6569 4.07112C14.0474 3.6806 14.0474 3.04743 13.6569 2.65691C13.2664 2.26638 12.6332 2.26638 12.2427 2.65691L8.00005 6.89954L3.75745 2.65694C3.36692 2.26641 2.73376 2.26641 2.34324 2.65694C1.95271 3.04746 1.95271 3.68063 2.34324 4.07115L6.58584 8.31375L2.34319 12.5564C1.95266 12.9469 1.95266 13.5801 2.34319 13.9706C2.73371 14.3611 3.36688 14.3611 3.7574 13.9706L8.00005 9.72796L12.2427 13.9706C12.6333 14.3612 13.2664 14.3612 13.6569 13.9706C14.0475 13.5801 14.0475 12.947 13.6569 12.5564L9.41426 8.31375L13.6569 4.07112Z"
                                    fill="#000"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                <div className={'adyen-fp-modal__content'}>{children}</div>
            </div>
        </div>
    );
}
