import Icon from '../Icon';
import { ExpandableCardProps } from './types';
import { PropsWithChildren } from 'preact/compat';
import classNames from 'classnames';
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import './ExpandableCard.scss';
import {
    BASE_CLASS,
    CHEVRON_CLASS,
    CONTAINER_BUTTON_CLASS,
    CONTAINER_CLASS,
    CONTAINER_FILLED_CLASS,
    CONTAINER_HIDDEN_CLASS,
    CONTAINER_OVERLAY_CLASS,
    CONTAINER_OVERLAY_ID,
    CONTENT_CLASS,
    CONTENT_EXPANDABLE_CLASS,
} from './constants';
import useCoreContext from '../../../core/Context/useCoreContext';
import { useClickOutside } from '../../../hooks/element/useClickOutside';
import BaseButton from '../BaseButton';

const ExpandableCard = ({ renderHeader, children, filled, fullWidth, ...listeners }: PropsWithChildren<ExpandableCardProps>) => {
    const { i18n } = useCoreContext();
    const [isOpen, setIsOpen] = useState(false);
    const toggleIsOpen = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);
    const expandButtonRef = useRef<HTMLButtonElement>(null);
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
        <div className={BASE_CLASS}>
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
                        <span className="adyen-pe-sr-only">{i18n.get('expandableCard.expand')}</span>
                        <div className={classNames(CONTENT_CLASS, CONTENT_EXPANDABLE_CLASS)}>{renderHeader}</div>
                        <div className={CHEVRON_CLASS}>
                            <Icon name="chevron-down" role="presentation" />
                        </div>
                    </BaseButton>
                    <BaseButton
                        id={CONTAINER_OVERLAY_ID}
                        className={classNames(CONTAINER_CLASS, CONTAINER_BUTTON_CLASS, CONTAINER_OVERLAY_CLASS, {
                            [CONTAINER_FILLED_CLASS]: filled,
                            [CONTAINER_HIDDEN_CLASS]: !isOpen,
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
                        <span className="adyen-pe-sr-only">{i18n.get('expandableCard.collapse')}</span>
                        <div className={classNames(CONTENT_CLASS, CONTENT_EXPANDABLE_CLASS)}>
                            {renderHeader}
                            <div>{children}</div>
                        </div>
                        <div className={CHEVRON_CLASS}>
                            <Icon name="chevron-up" role="presentation" />
                        </div>
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
