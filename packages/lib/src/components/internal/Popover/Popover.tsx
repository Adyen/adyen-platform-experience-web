import ButtonActions from '@src/components/internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayout, ButtonActionsLayoutBasic, ButtonActionsList } from '@src/components/internal/Button/ButtonActions/types';
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
import { MutableRef, useCallback, useEffect } from 'preact/hooks';
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
                    {image && (
                        <div className="adyen-fp-popover__image">
                            {dismissible && <PopoverDismissButton onClick={dismiss} />}
                            {image}
                        </div>
                    )}
                    {title && (
                        <div className={getModifierClasses('adyen-fp-popover__header', modifiers, 'adyen-fp-popover__header')}>
                            <div className={'adyen-fp-popover__header-title'}>
                                {headerIcon ? { headerIcon } : null}
                                <PopoverTitle title={title} isImageTitle={Boolean(image)} />
                            </div>
                            {dismissible && !image && <PopoverDismissButton onClick={dismiss} />}
                        </div>
                    )}
                    {children && <div className="adyen-fp-popover__content">{children}</div>}
                    {actions && (
                        <div className="adyen-fp-popover__footer">
                            <ButtonActions actions={actions} layout={actionsLayout} />
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
}
export default Popover;
