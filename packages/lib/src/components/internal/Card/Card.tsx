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
    classNameModifiers,
}: PropsWithChildren<CardProps>) => {
    return (
        <section
            className={classNames('adyen-pe-card', { 'adyen-pe-card--filled': filled, 'adyen-pe-card--no-outline': noOutline }, classNameModifiers)}
        >
            {(title || renderHeader) && (
                <header className={'adyen-pe-card__header'}>
                    {(title || renderHeader) && (
                        <div className="adyen-pe-card__header-content">
                            {renderHeader ? renderHeader : <span className="adyen-pe-card__title">{title}</span>}
                            {subTitle && <div className="adyen-pe-card__subtitle">{subTitle}</div>}
                        </div>
                    )}
                </header>
            )}
            <div
                className={classNames('adyen-pe-card__body', {
                    'adyen-pe-card__body--with-title': title || renderHeader,
                })}
            >
                {children}
            </div>
            {(footer || renderFooter) && <footer className="adyen-pe-card__footer">{renderFooter ? renderFooter : footer}</footer>}
        </section>
    );
};

export default Card;
