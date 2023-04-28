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
        setIsOpen(!isOpen);
    };
    return (
        <section
            className={classNames('adyen-fp-card', { 'adyen-fp-card--filled': filled, 'adyen-fp-card--no-outline': noOutline })}
            tabIndex={0}
            role={'button'}
            onClick={onClickHandler}
        >
            {(title || renderHeader) && (
                <div className="adyen-fp-card__header">
                    <div className={classNames({ 'adyen-fp-card__header-collapsible': collapsible })}>
                        <div className="adyen-fp-card__collapse-button" onClick={toggleIsOpen} role="button" tabIndex={0}>
                            <span
                                className={classNames({
                                    'adyen-fp-card__collapsible-icon': collapsible,
                                    'adyen-fp-card__collapsible-icon--collapsed': !isOpen,
                                    'adyen-fp-card__collapsible-icon--opened': isOpen,
                                })}
                            ></span>
                        </div>
                        <div className="adyen-fp-card__header-collapsible-content">
                            {renderHeader ? renderHeader : <span className="adyen-fp-card__title">{title}</span>}
                            <div v-if="subTitle" className="adyen-fp-card__subtitle">
                                {subTitle}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <CollapsibleContainer isOpen={isOpen}>
                <div
                    className={classNames('adyen-fp-card__body', {
                        'adyen-fp-card__body--with-title': title || renderHeader,
                        'adyen-fp-card__body--hidden': !isOpen,
                    })}
                >
                    {children}
                </div>
            </CollapsibleContainer>
            {(footer || renderFooter) && <footer className="adyen-fp-card__footer">{renderFooter ? renderFooter : footer}</footer>}
        </section>
    );
};

export default Card;
