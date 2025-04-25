import classNames from 'classnames';
import { ExpandableCardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import { useClickOutside } from '../../../hooks/element/useClickOutside';
import useCoreContext from '../../../core/Context/useCoreContext';
import BaseButton from '../BaseButton';
import ChevronUp from '../SVGIcons/ChevronUp';
import ChevronDown from '../SVGIcons/ChevronDown';
import './ExpandableCard.scss';
import {
    BASE_CLASS,
    CARD_HEIGHT_PROPERTY,
    CHEVRON_CLASS,
    CONTAINER_BUTTON_CLASS,
    CONTAINER_CLASS,
    CONTAINER_FILLED_CLASS,
    CONTAINER_HIDDEN_CLASS,
    CONTAINER_IN_FLOW_CLASS,
    CONTAINER_OVERLAY_CLASS,
    CONTAINER_OVERLAY_ID,
    CONTENT_CLASS,
    CONTENT_EXPANDABLE_CLASS,
} from './constants';

const ExpandableCard = ({
    renderHeader,
    children,
    headerDirection = 'column',
    filled,
    fullWidth,
    inFlow,
    ...listeners
}: PropsWithChildren<ExpandableCardProps>) => {
    const { i18n } = useCoreContext();
    const [isOpen, setIsOpen] = useState(false);
    const [collapsedCardHeight, setCollapsedCardHeight] = useState(0);
    const inNormalFlow = useMemo(() => inFlow === true, [inFlow]);
    const toggleIsOpen = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
    const expandableCardRef = useRef<HTMLDivElement>(null);
    const isClosedFromOutside = useRef(false);
    const isOpenRef = useRef(isOpen);

    const clickOutsideRef = useClickOutside<HTMLElement>(
        undefined,
        useCallback(() => {
            if (isOpen) {
                toggleIsOpen();
                isClosedFromOutside.current = true;
            }
        }, [isOpen, toggleIsOpen])
    );

    useLayoutEffect(() => {
        const cardElement = expandableCardRef.current;
        if (!cardElement) return;

        if (inNormalFlow) {
            // The inNormalFlow value is currently `true`,
            // Ensure the collapsed card height property is up-to-date
            cardElement.style.setProperty(CARD_HEIGHT_PROPERTY, `${collapsedCardHeight}px`);
        } else if (!isOpen) {
            // The card isn't currently expanded, and the inNormalFlow value is currently `false`
            // The collapsed card height property is no longer needed
            cardElement.style.removeProperty(CARD_HEIGHT_PROPERTY);
        }
    }, [collapsedCardHeight, inNormalFlow, isOpen]);

    useEffect(() => {
        if (!inNormalFlow) return void setCollapsedCardHeight(0);

        const element = expandButtonRef.current;
        if (!element) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target !== element) continue;
                setCollapsedCardHeight(element.offsetHeight || 0);
            }
        });

        resizeObserver.observe(element);

        return () => {
            resizeObserver.unobserve(element);
            resizeObserver.disconnect();
        };
    }, [inNormalFlow]);

    useEffect(() => {
        if (isOpen) {
            clickOutsideRef.current?.focus();
        } else {
            // We want to manually focus the expand button only when the card is collapsed by inside clicks
            // Therefore we skip the manual focus initially when isOpen is false and when we have outside clicks
            if (isOpenRef.current !== isOpen && !isClosedFromOutside.current) {
                expandButtonRef.current?.focus();
            }
            isClosedFromOutside.current = false;
        }
        isOpenRef.current = isOpen;
    }, [isOpen, clickOutsideRef]);

    return (
        <div ref={expandableCardRef} className={BASE_CLASS}>
            {children ? (
                <>
                    <BaseButton
                        className={classNames(CONTAINER_CLASS, CONTAINER_BUTTON_CLASS, { [CONTAINER_FILLED_CLASS]: filled })}
                        disabled={isOpen}
                        fullWidth={fullWidth}
                        aria-controls={CONTAINER_OVERLAY_ID}
                        aria-expanded={isOpen}
                        aria-hidden={isOpen}
                        onClick={toggleIsOpen}
                        ref={expandButtonRef}
                        data-testid={'expand-button'}
                        {...listeners}
                    >
                        <div className={`${CONTENT_EXPANDABLE_CLASS}-${headerDirection}`}>
                            <span className="adyen-pe-visually-hidden">{i18n.get('expandableCard.expand')}</span>
                            <div className={classNames(CONTENT_CLASS, CONTENT_EXPANDABLE_CLASS)}>{renderHeader}</div>
                            <div className={CHEVRON_CLASS}>
                                <ChevronDown role="presentation" />
                            </div>
                        </div>
                    </BaseButton>
                    <BaseButton
                        id={CONTAINER_OVERLAY_ID}
                        className={classNames(CONTAINER_CLASS, CONTAINER_BUTTON_CLASS, CONTAINER_OVERLAY_CLASS, {
                            [CONTAINER_FILLED_CLASS]: filled,
                            [CONTAINER_HIDDEN_CLASS]: !isOpen,
                            [CONTAINER_IN_FLOW_CLASS]: inNormalFlow,
                        })}
                        disabled={!isOpen}
                        fullWidth={fullWidth}
                        aria-controls={CONTAINER_OVERLAY_ID}
                        aria-expanded={isOpen}
                        aria-hidden={!isOpen}
                        onClick={toggleIsOpen}
                        ref={clickOutsideRef}
                        data-testid={'collapse-button'}
                        {...listeners}
                    >
                        {headerDirection === 'column' ? (
                            <div className={`${CONTENT_EXPANDABLE_CLASS}-${headerDirection}`}>
                                <span className="adyen-pe-visually-hidden">{i18n.get('expandableCard.collapse')}</span>
                                <div className={classNames(CONTENT_CLASS, CONTENT_EXPANDABLE_CLASS)}>
                                    {renderHeader}
                                    <div>{children}</div>
                                </div>
                                <div className={CHEVRON_CLASS}>
                                    <ChevronUp role="presentation" />
                                </div>
                            </div>
                        ) : (
                            <div className={`${CONTENT_EXPANDABLE_CLASS}`}>
                                <div className={`${CONTENT_EXPANDABLE_CLASS}-${headerDirection}`}>
                                    <span className="adyen-pe-visually-hidden">{i18n.get('expandableCard.collapse')}</span>
                                    <div className={classNames(CONTENT_CLASS, CONTENT_EXPANDABLE_CLASS)}>{renderHeader}</div>
                                    <div className={CHEVRON_CLASS}>
                                        <ChevronUp role="presentation" />
                                    </div>
                                </div>
                                <div className={`${CONTENT_EXPANDABLE_CLASS}-body`}>{children}</div>
                            </div>
                        )}
                    </BaseButton>
                </>
            ) : (
                <div className={classNames(CONTAINER_CLASS, { [CONTAINER_FILLED_CLASS]: filled })} {...listeners}>
                    <div className={CONTENT_CLASS}>{renderHeader}</div>
                </div>
            )}
        </div>
    );
};

export default ExpandableCard;
