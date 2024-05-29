import {
    CARD_BASE_CLASS,
    CARD_BODY,
    CARD_BODY_WITH_TITLE,
    CARD_FILLED,
    CARD_FOOTER,
    CARD_HEADER,
    CARD_HEADER_CONTENT,
    CARD_NO_OUTLINE,
    CARD_SUBTITLE,
    CARD_TITLE,
} from './constants';
import { CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import classNames from 'classnames';

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
        <section className={classNames(CARD_BASE_CLASS, { [CARD_FILLED]: filled, [CARD_NO_OUTLINE]: noOutline }, classNameModifiers)}>
            {(title || renderHeader) && (
                <header className={CARD_HEADER}>
                    {(title || renderHeader) && (
                        <div className={CARD_HEADER_CONTENT}>
                            {renderHeader ? renderHeader : <span className={CARD_TITLE}>{title}</span>}
                            {subTitle && <div className={CARD_SUBTITLE}>{subTitle}</div>}
                        </div>
                    )}
                </header>
            )}
            <div
                className={classNames(CARD_BODY, {
                    [CARD_BODY_WITH_TITLE]: title || renderHeader,
                })}
            >
                {children}
            </div>
            {(footer || renderFooter) && <footer className={CARD_FOOTER}>{renderFooter ? renderFooter : footer}</footer>}
        </section>
    );
};

export default Card;
