import ButtonActions from '@src/components/internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayout, ButtonActionsLayoutBasic, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import {
    DEFAULT_POPOVER_CLASSNAME,
    POPOVER_CONTAINER_CLASSNAME,
    POPOVER_CONTENT_CLASSNAME,
    POPOVER_FOOTER_CLASSNAME,
    POPOVER_HEADER_CLASSNAME,
    POPOVER_HEADER_TITLE_CLASSNAME,
    POPOVER_IMAGE_CLASSNAME,
} from '@src/components/internal/Popover/constants';
import PopoverDismissButton from '@src/components/internal/Popover/PopoverDismissButton/PopoverDismissButton';
import PopoverTitle from '@src/components/internal/Popover/PopoverTitle/PopoverTitle';
import { PopoverContainerAriaRole, PopoverContainerPosition, PopoverContainerSize } from '@src/components/internal/Popover/types';
import { InteractionKeyCode } from '@src/components/types';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import usePopoverPositioner from '@src/hooks/element/usePopoverPositioner';
import getModifierClasses from '@src/utils/get-modifier-classes';
import classNames from 'classnames';
import { ComponentChildren } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { MutableRef, useCallback, useEffect, useMemo } from 'preact/hooks';
import './Popover.scss';
import './PopoverContainer.scss';

interface PopoverProps {
    actions?: ButtonActionsList;
    actionsLayout?: ButtonActionsLayout;
    ariaLabel: string;
    divider?: boolean;
    dismissible?: boolean;
    fitContent?: boolean;
    disableFocusTrap?: boolean;
    open?: boolean;
    modifiers?: string[];
    position?: PopoverContainerPosition;
    containerSize?: PopoverContainerSize;
    title?: string;
    targetElement: MutableRef<any>;
    withoutSpace?: boolean;
    image?: Node;
    headerIcon?: Node;
    dismiss: () => any;
    children: ComponentChildren;
}

const isFocusable = (item: any) => {
    if (item.tabIndex < 0) {
        return false;
    }
    switch (item.tagName) {
        case 'A':
            return !!item.href;
        case 'INPUT':
            return item.type !== 'hidden' && !item.disabled;
        case 'SELECT':
        case 'TEXTAREA':
        case 'BUTTON':
            return !item.disabled;
        default:
            return false;
    }
};

const findFirstFocusableElement = () => {
    const focusable = Array.from(document.getElementsByClassName('adyen-fp-popover__content')?.[0]?.children ?? []);
    return focusable.find(item => {
        return isFocusable(item);
    });
};

function Popover({
    actions,
    disableFocusTrap = false,
    actionsLayout = ButtonActionsLayoutBasic.SPACE_BETWEEN,
    title,
    open,
    ariaLabel,
    dismissible,
    modifiers,
    image,
    divider,
    fitContent,
    withoutSpace,
    containerSize,
    headerIcon,
    position = PopoverContainerPosition.BOTTOM,
    targetElement,
    dismiss,
    children,
}: PropsWithChildren<PopoverProps>) {
    const onCloseFocusTrap = useCallback((interactionKeyPressed: boolean) => {
        dismiss();
        if (interactionKeyPressed) {
            targetElement.current.focus();
        }
    }, []);

    const popoverElement = disableFocusTrap
        ? usePopoverPositioner([0, 15], position, targetElement)
        : useFocusTrap(usePopoverPositioner([0, 15], position, targetElement), onCloseFocusTrap);

    const conditionalClasses = useMemo(
        () => ({
            'adyen-fp-popover--small': containerSize === PopoverContainerSize.SMALL,
            'adyen-fp-popover--with-divider': !!divider,
            'adyen-fp-popover--large': containerSize === PopoverContainerSize.LARGE,
            'adyen-fp-popover--fit-content': fitContent,
            'adyen-fp-popover--without-space': withoutSpace,
        }),
        [containerSize, divider, withoutSpace, fitContent]
    );

    const handleClickOutside = useCallback(
        (e: Event) => {
            const element = document.getElementById('popover');
            if (!element?.contains(e.target as Node)) {
                dismiss();
            }
        },
        [dismiss]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.code === InteractionKeyCode.ESCAPE) {
                dismiss();
                targetElement.current.focus();
            }
        },
        [dismiss, targetElement]
    );

    useEffect(() => {
        const focusable = findFirstFocusableElement() as HTMLElement;
        focusable?.focus();
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    return (
        <>
            {open ? (
                <div
                    id="popover"
                    ref={popoverElement}
                    aria-label={ariaLabel}
                    className={classNames(`${DEFAULT_POPOVER_CLASSNAME} ${POPOVER_CONTAINER_CLASSNAME}`, conditionalClasses)}
                    role={PopoverContainerAriaRole.POPOVER}
                >
                    {image && (
                        <div className={POPOVER_IMAGE_CLASSNAME}>
                            {dismissible && <PopoverDismissButton onClick={dismiss} />}
                            {image}
                        </div>
                    )}
                    {title && (
                        <div className={getModifierClasses(POPOVER_HEADER_CLASSNAME, modifiers, [POPOVER_HEADER_CLASSNAME])}>
                            <div className={POPOVER_HEADER_TITLE_CLASSNAME}>
                                {headerIcon ? { headerIcon } : null}
                                <PopoverTitle title={title} isImageTitle={Boolean(image)} />
                            </div>
                            {dismissible && !image && <PopoverDismissButton onClick={dismiss} />}
                        </div>
                    )}
                    {children && <div className={POPOVER_CONTENT_CLASSNAME}>{children}</div>}
                    {actions && (
                        <div className={POPOVER_FOOTER_CLASSNAME}>
                            <ButtonActions actions={actions} layout={actionsLayout} />
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
}
export default Popover;
