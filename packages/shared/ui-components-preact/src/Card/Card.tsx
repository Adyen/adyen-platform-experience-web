import { HTMLAttributes } from 'preact';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'preact/hooks';
import { uuid } from '@integration-components/utils';
import { InteractionKeyCode } from '@integration-components/types';
import Icon from '../Icon';
import {
    CARD_BASE_CLASS,
    CARD_BODY,
    CARD_BODY_WITH_TITLE,
    CARD_CLICKABLE,
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

type AriaRole = HTMLAttributes<HTMLDivElement>['role'];

const Card = ({
    title,
    subTitle,
    children,
    expandable = false,
    footer,
    onClick,
    renderHeader,
    renderFooter,
    filled,
    noOutline,
    noPadding,
    classNameModifiers,
    testId,
    compact,
    role,
    ariaChecked,
    ariaDisabled,
}: PropsWithChildren<CardProps>) => {
    const [showContent, setShowContent] = useState(false);
    const cardId = useMemo(() => uuid(), []);

    const toggleExpansion = useCallback(() => {
        if (expandable) {
            setShowContent(showContent => !showContent);
        }
    }, [expandable]);

    const handleClick = useCallback(() => {
        toggleExpansion();
        onClick?.();
    }, [onClick, toggleExpansion]);

    const onKeyDown = useCallback(
        (evt: KeyboardEvent) => {
            switch (evt.code) {
                case InteractionKeyCode.ENTER:
                case InteractionKeyCode.SPACE:
                    evt.preventDefault();
                    handleClick();
                    return;
            }
        },
        [handleClick]
    );

    const cardContainerAttributes = useMemo(() => {
        if (expandable) {
            return {
                role: 'button' as AriaRole,
                tabIndex: 0,
                onClick: handleClick,
                onKeyDown: onKeyDown,
                'aria-controls': cardId,
                'aria-expanded': showContent,
            };
        }
        if (onClick) {
            return {
                role: (role ?? 'button') as AriaRole,
                tabIndex: 0,
                onClick: handleClick,
                onKeyDown,
                ...(ariaChecked !== undefined && { 'aria-checked': ariaChecked }),
                ...(ariaDisabled !== undefined && { 'aria-disabled': ariaDisabled }),
            };
        }
        if (role !== undefined || ariaChecked !== undefined || ariaDisabled !== undefined) {
            return {
                ...(role !== undefined && { role: role as AriaRole }),
                ...(ariaChecked !== undefined && { 'aria-checked': ariaChecked }),
                ...(ariaDisabled !== undefined && { 'aria-disabled': ariaDisabled }),
            };
        }
        return {};
    }, [expandable, onClick, handleClick, onKeyDown, cardId, showContent, role, ariaChecked, ariaDisabled]);

    return (
        <div
            data-testid={testId}
            className={classNames(CARD_BASE_CLASS, classNameModifiers, {
                [CARD_FILLED]: filled,
                [CARD_NO_OUTLINE]: noOutline,
                [CARD_NO_PADDING]: noPadding,
                [CARD_EXPANDABLE_CLASS]: expandable,
                [CARD_CLICKABLE]: !!onClick,
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
