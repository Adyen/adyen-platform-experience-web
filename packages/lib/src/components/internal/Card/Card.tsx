import { CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import './Card.scss';
import classNames from 'classnames';
import { useState } from 'preact/hooks';
import CollapsibleContainer from '../CollapsibleContainer/CollapsibleContainer';
const Card = ({
    onClickHandler,
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
}: PropsWithChildren<CardProps>) => {
    const [isOpen, setIsOpen] = useState(openByDefault);
    const toggleIsOpen = () => {
        // onClickHandler?.();
        setIsOpen(!isOpen);
    };
    return (
        <section className={classNames('adyen-fp-card', { 'adyen-fp-card--filled': filled, 'adyen-fp-card--no-outline': noOutline })}>
            <header className={classNames('adyen-fp-card__header', { 'adyen-fp-card__header-collapsible': collapsible })}>
                {collapsible && (
                    <div role="presentation">
                        <button
                            className="adyen-fp-card__collapse-button"
                            aria-expanded={`${!!isOpen}`}
                            aria-controls="collapsible-container-id"
                            aria-label="useful-label-text"
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
                        {renderHeader ? (
                            renderHeader
                        ) : (
                            <span className="adyen-fp-card__title" onClick={onClickHandler}>
                                {title}
                            </span>
                        )}
                        {subTitle && <div className="adyen-fp-card__subtitle">{subTitle}</div>}
                    </div>
                )}
            </header>
            <CollapsibleContainer isOpen={isOpen}>
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
