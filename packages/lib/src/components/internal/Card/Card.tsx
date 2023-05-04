import { CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import './Card.scss';
import classNames from 'classnames';
import { useCallback, useState } from 'preact/hooks';
import CollapsibleContainer from '../CollapsibleContainer/CollapsibleContainer';
import { getUniqueId } from '../../../utils/idGenerator';
const Card = ({
    title,
    subTitle,
    children,
    footer,
    renderHeader,
    renderFooter,
    filled,
    noOutline,
    collapsible,
    openByDefault = true,
    buttonAriaLabel = 'toggle-content',
}: PropsWithChildren<CardProps>) => {
    const [isOpen, setIsOpen] = useState(openByDefault);
    const toggleIsOpen = useCallback(() => setIsOpen(isOpen => !isOpen), []);
    const ariaControllerId = getUniqueId();
    return (
        <section className={classNames('adyen-fp-card', { 'adyen-fp-card--filled': filled, 'adyen-fp-card--no-outline': noOutline })}>
            <header className={classNames('adyen-fp-card__header', { 'adyen-fp-card__header-collapsible': collapsible })}>
                {collapsible && (
                    <div role="presentation">
                        <button
                            className="adyen-fp-card__collapse-button"
                            aria-expanded={`${!!isOpen}`}
                            aria-controls={ariaControllerId}
                            aria-label={buttonAriaLabel}
                            onClick={toggleIsOpen}
                        >
                            <span
                                className={classNames({
                                    'adyen-fp-card__collapsible-icon': collapsible,
                                    'adyen-fp-card__collapsible-icon--collapsed': !isOpen,
                                    'adyen-fp-card__collapsible-icon--opened': isOpen,
                                })}
                            ></span>
                        </button>
                    </div>
                )}
                {(title || renderHeader) && (
                    <div className="adyen-fp-card__header-collapsible-content">
                        {renderHeader ? renderHeader : <span className="adyen-fp-card__title">{title}</span>}
                        {subTitle && <div className="adyen-fp-card__subtitle">{subTitle}</div>}
                    </div>
                )}
            </header>
            <CollapsibleContainer isOpen={isOpen} accessibilityId={ariaControllerId}>
                <div
                    className={classNames('adyen-fp-card__body', {
                        'adyen-fp-card__body--with-title': title || renderHeader,
                        'adyen-fp-card__body--hidden': !isOpen,
                    })}
                >
                    {children}
                </div>
                {(footer || renderFooter) && <footer className="adyen-fp-card__footer">{renderFooter ? renderFooter : footer}</footer>}
            </CollapsibleContainer>
        </section>
    );
};

export default Card;
