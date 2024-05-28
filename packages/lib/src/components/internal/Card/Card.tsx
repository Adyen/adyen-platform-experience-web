import useCoreContext from '../../../core/Context/useCoreContext';
import { CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import classNames from 'classnames';
import { useCallback, useState } from 'preact/hooks';
import { getUniqueId } from '../../../utils/idGenerator';
import './Card.scss';

const Card = ({
    title,
    subTitle,
    children,
    footer,
    renderHeader,
    renderFooter,
    filled,
    noOutline,
    collapsible = false,
    openByDefault = true,
    buttonAriaLabel,
    classNameModifiers,
}: PropsWithChildren<CardProps>) => {
    const { i18n } = useCoreContext();
    const [isOpen, setIsOpen] = useState(openByDefault);
    const toggleIsOpen = useCallback(() => setIsOpen(isOpen => !isOpen), []);
    const ariaControllerId = getUniqueId();
    const labelText = buttonAriaLabel || (isOpen ? i18n.get('hideContent') : i18n.get('expandContent'));
    return (
        <section
            className={classNames('adyen-pe-card', { 'adyen-pe-card--filled': filled, 'adyen-pe-card--no-outline': noOutline }, classNameModifiers)}
        >
            {(title || renderHeader) && (
                <header className={classNames('adyen-pe-card__header', { 'adyen-pe-card__header-collapsible': collapsible })}>
                    {collapsible && (
                        <div role="presentation">
                            <button
                                className="adyen-pe-card__collapse-button"
                                aria-expanded={`${!!isOpen}`}
                                aria-controls={ariaControllerId}
                                aria-label={labelText}
                                onClick={toggleIsOpen}
                            >
                                <span
                                    className={classNames({
                                        'adyen-pe-card__collapsible-icon': collapsible,
                                        'adyen-pe-card__collapsible-icon--collapsed': !isOpen,
                                        'adyen-pe-card__collapsible-icon--opened': isOpen,
                                    })}
                                ></span>
                            </button>
                        </div>
                    )}
                    {(title || renderHeader) && (
                        <div className="adyen-pe-card__header-collapsible-content">
                            {renderHeader ? renderHeader : <span className="adyen-pe-card__title">{title}</span>}
                            {subTitle && <div className="adyen-pe-card__subtitle">{subTitle}</div>}
                        </div>
                    )}
                </header>
            )}
            <div
                className={classNames('adyen-pe-card__body', {
                    'adyen-pe-card__body--with-title': title || renderHeader,
                    'adyen-pe-card__body--hidden': !isOpen,
                })}
            >
                {children}
            </div>
            {(footer || renderFooter) && <footer className="adyen-pe-card__footer">{renderFooter ? renderFooter : footer}</footer>}
        </section>
    );
};

export default Card;
