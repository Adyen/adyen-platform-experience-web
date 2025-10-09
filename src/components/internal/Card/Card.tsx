import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { uuid } from '../../../utils';
import { InteractionKeyCode } from '../../types';
import Icon from '../Icon';
import {
    CARD_BASE_CLASS,
    CARD_BODY,
    CARD_BODY_WITH_TITLE,
    CARD_COMPACT,
    CARD_EXPANDABLE_CLASS,
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
import { CardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import './Card.scss';

type AriaRole = JSXInternal.HTMLAttributes<HTMLDivElement>['role'];

const Card = ({
    title,
    subTitle,
    children,
    expandable = false,
    footer,
    renderHeader,
    renderFooter,
    filled,
    noOutline,
    noPadding,
    classNameModifiers,
    testId,
    compact,
}: PropsWithChildren<CardProps>) => {
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
        <div
            data-testid={testId}
            className={classNames(CARD_BASE_CLASS, classNameModifiers, {
                [CARD_FILLED]: filled,
                [CARD_NO_OUTLINE]: noOutline,
                [CARD_NO_PADDING]: noPadding,
                [CARD_EXPANDABLE_CLASS]: expandable,
                [CARD_COMPACT]: compact,
            })}
            {...cardContainerAttributes}
        >
            {(title || renderHeader) && (
                <div className={classNames(CARD_HEADER)}>
                    <div className={classNames(CARD_HEADER_CONTENT)}>
                        {expandable && <Icon name={showContent ? 'chevron-up' : 'chevron-down'} className={CARD_TOGGLE_CLASS} role="presentation" />}
                        {renderHeader ? renderHeader : <span className={CARD_TITLE}>{title}</span>}
                        {subTitle && <div className={CARD_SUBTITLE}>{subTitle}</div>}
                    </div>
                </div>
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
            {(footer || renderFooter) && <div className={CARD_FOOTER}>{renderFooter ? renderFooter : footer}</div>}
        </div>
    );
};

export default Card;
