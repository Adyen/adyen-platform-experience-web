import { PropsWithChildren } from 'preact/compat';
import getModifierClasses from '@src/utils/get-modifierClasses';
import PopoverTitle from '@src/components/internal/Popover/PopoverTitle/PopoverTitle';
import PopoverDismissButton from '@src/components/internal/Popover/PopoverDismissButton/PopoverDismissButton';
import { ButtonActionsLayout, ButtonActionsLayoutBasic, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
import ButtonActions from '@src/components/internal/Button/ButtonActions/ButtonActions';
import { PopoverContainerAriaRole, PopoverContainerPosition, PopoverContainerSize } from '@src/components/internal/Popover/types';
import './Popover.scss';
import './PopoverContainer.scss';
import classNames from 'classnames';
import { MutableRef, useCallback, useEffect } from 'preact/hooks';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import usePopoverPositioner from '@src/hooks/element/usePopoverPositioner';
import { InteractionKeyCode } from '@src/components/types';
import { ComponentChildren } from 'preact';

//TODO: make large and small as enum
interface PopoverProps {
    actions?: ButtonActionsList;
    actionsLayout?: ButtonActionsLayout;
    ariaLabel: string;
    divider?: boolean;
    dismissible?: boolean;
    fitContent?: boolean;
    disableFocusTrap?: boolean;
    fixedPositioning?: boolean;
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
    const conditionalClasses = () => ({
        'adyen-fp-popover--small': containerSize === PopoverContainerSize.SMALL,
        'adyen-fp-popover--with-divider': !!divider,
        'adyen-fp-popover--large': containerSize === PopoverContainerSize.LARGE,
        'adyen-fp-popover--fit-content': fitContent,
        'adyen-fp-popover--without-space': withoutSpace,
    });

    const handleClickOutside = (e: Event) => {
        const element = document.getElementById('popover');
        if (!element?.contains(e.target as Node)) {
            dismiss();
        }
    };

    const onKeyDown = (e: KeyboardEvent) => {
        if (e.code === InteractionKeyCode.ESCAPE) {
            dismiss();
            targetElement.current.focus();
        }
    };

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
        var focusable = Array.from(document.getElementsByClassName('adyen-fp-popover__content')?.[0]?.children ?? []);
        return focusable.find(item => {
            return isFocusable(item);
        });
    };

    useEffect(() => {
        const focusable = findFirstFocusableElement() as HTMLElement;
        console.log('focusable ', focusable);
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
                    className={classNames('adyen-fp-popover adyen-fp-popover-container', conditionalClasses())}
                    role={PopoverContainerAriaRole.POPOVER}
                >
                    {/*TODO: Check this dismissable button*/}
                    {image && (
                        <div className="adyen-fp-popover__image">
                            {dismissible && <PopoverDismissButton click={dismiss} />}
                            {image}
                        </div>
                    )}
                    {title && (
                        <div className={getModifierClasses('adyen-fp-popover__header', 'adyen-fp-popover__header', modifiers)}>
                            <div className={'adyen-fp-popover__header-title'}>
                                {headerIcon ? { headerIcon } : null}
                                <PopoverTitle title={title} isImageTitle={Boolean(image)}></PopoverTitle>
                            </div>
                            {dismissible && !image && <PopoverDismissButton click={dismiss} />}
                        </div>
                    )}
                    {children && <div className="adyen-fp-popover__content">{children}</div>}
                    {actions && (
                        <div className="adyen-fp-popover__footer">
                            <ButtonActions actions={actions} layout={actionsLayout}></ButtonActions>
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
}
export default Popover;
