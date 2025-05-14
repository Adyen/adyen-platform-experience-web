import { useCallback, useMemo, useState } from 'preact/hooks';
import { uuid } from '../../../utils';
import { InteractionKeyCode } from '../../types';
import Icon from '../Icon';
import {
    CARD_BASE_CLASS,
    CARD_BODY,
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
            setShowContent(showContent => !showContent);
        }
    }, [expandable]);

    const onKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                    evt.preventDefault();
                    toggleExpansion();
                    return;
            }
        },
        [toggleExpansion]
    );

    const cardContainerAttributes = useMemo(() => {
        return expandable
            ? {
                  role: 'button' as AriaRole,
                  tabIndex: 0,
                  onClick: toggleExpansion,
                  onKeyDown: onKeyDown,
                  'aria-controls': cardId,
                  'aria-expanded': showContent,
              }
            : {};
    }, [expandable, showContent, cardId, onKeyDown, toggleExpansion]);

    return (
        <section
            className={classNames(
                CARD_BASE_CLASS,
                { [CARD_FILLED]: filled, [CARD_NO_OUTLINE]: noOutline, [CARD_NO_PADDING]: noPadding, [`${CARD_BASE_CLASS}--expandable`]: expandable },
                classNameModifiers
            )}
            data-testid={testId}
            {...cardContainerAttributes}
        >
            {(title || renderHeader) && (
                <Tag className={classNames(CARD_HEADER)}>
                    <div className={classNames(CARD_HEADER_CONTENT)}>
                        {expandable &&
                            (showContent ? (
                                <Icon name={'chevron-up'} role="presentation" className={CARD_TOGGLE_CLASS} />
                            ) : (
                                <Icon name={'chevron-down'} role="presentation" className={CARD_TOGGLE_CLASS} />
                            ))}
                        {renderHeader ? renderHeader : <span className={CARD_TITLE}>{title}</span>}
                        {subTitle && <div className={CARD_SUBTITLE}>{subTitle}</div>}
                    </div>
                </Tag>
            )}
            {(!expandable || showContent) && (
                <div
                    id={cardId}
                    className={classNames(CARD_BODY, {
                        [CARD_BODY_WITH_TITLE]: title || renderHeader,
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
