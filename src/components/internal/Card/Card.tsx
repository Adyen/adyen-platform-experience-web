import { useCallback, useMemo, useState } from 'preact/hooks';
import { uuid } from '../../../utils';
import { InteractionKeyCode } from '../../types';
import ChevronDown from '../SVGIcons/ChevronDown';
import ChevronUp from '../SVGIcons/ChevronUp';
import {
    CARD_BASE_CLASS,
    CARD_BODY,
    CARD_BODY_EXPANDABLE,
    CARD_BODY_WITH_TITLE,
    CARD_FILLED,
    CARD_FOOTER,
    CARD_HEADER,
    CARD_HEADER_CONTENT,
    CARD_NO_OUTLINE,
    CARD_NO_PADDING,
    CARD_SUBTITLE,
    CARD_TITLE,
    CARD_TOGGLE_CLASS,
} from './constants';
import { AriaRole, CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import classNames from 'classnames';
import './Card.scss';

const Card = ({
    title,
    subTitle,
    children,
    expandable = false,
    footer,
    el,
    renderHeader,
    renderFooter,
    filled,
    noOutline,
    noPadding,
    classNameModifiers,
    testId,
}: PropsWithChildren<CardProps>) => {
    const Tag = el || 'header';
    const [showContent, setShowContent] = useState(false);
    const cardId = useMemo(() => uuid(), []);

    const toggleExpansion = useCallback(() => {
        if (expandable) {
            setShowContent(!showContent);
        }
    }, [expandable, showContent]);

    const onKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            if (evt.code === InteractionKeyCode.ENTER || evt.code === InteractionKeyCode.SPACE) {
                toggleExpansion();
            }
        },
        [toggleExpansion]
    );

    const cardContainerAttributes = useMemo(() => {
        return {
            ...(expandable && ({ role: 'button' } as AriaRole)),
            ...(expandable && { tabIndex: 0 }),
            ...(expandable && { 'aria-controls': cardId }),
            ...(expandable && { 'aria-expanded': showContent }),
            ...(expandable && { onClick: toggleExpansion }),
            ...(expandable && { onKeyDown: onKeyDown }),
        };
    }, [expandable, showContent, cardId, onKeyDown, toggleExpansion]);

    return (
        <section
            className={classNames(
                CARD_BASE_CLASS,
                { [CARD_FILLED]: filled, [CARD_NO_OUTLINE]: noOutline, [CARD_NO_PADDING]: noPadding },
                classNameModifiers
            )}
            data-testid={testId}
            {...cardContainerAttributes}
        >
            {(title || renderHeader) && (
                <Tag className={classNames(CARD_HEADER, { [`${CARD_HEADER}--expandable`]: expandable })}>
                    {(title || renderHeader) && (
                        <div className={classNames(CARD_HEADER_CONTENT, { [`${CARD_HEADER_CONTENT}--expandable`]: expandable })}>
                            {expandable && (
                                <div className={CARD_TOGGLE_CLASS}>
                                    {showContent ? <ChevronUp role="presentation" /> : <ChevronDown role="presentation" />}
                                </div>
                            )}
                            {renderHeader ? renderHeader : <span className={CARD_TITLE}>{title}</span>}
                            {subTitle && <div className={CARD_SUBTITLE}>{subTitle}</div>}
                        </div>
                    )}
                </Tag>
            )}
            {(!expandable || (expandable && showContent)) && (
                <div
                    id={cardId}
                    className={classNames(CARD_BODY, {
                        [CARD_BODY_WITH_TITLE]: title || renderHeader,
                        [CARD_BODY_EXPANDABLE]: expandable,
                    })}
                >
                    {children}
                </div>
            )}
            {(footer || renderFooter) && <footer className={CARD_FOOTER}>{renderFooter ? renderFooter : footer}</footer>}
        </section>
    );
};

export default Card;
