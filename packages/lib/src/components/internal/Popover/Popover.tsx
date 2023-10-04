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
        'popover--small': containerSize === PopoverContainerSize.SMALL,
        'popover--with-divider': !!divider,
        'popover--large': containerSize === PopoverContainerSize.LARGE,
        'popover--fit-content': fitContent,
        'popover--without-space': withoutSpace,
    });

    const handleClickOutside = (e: Event) => {
        const element = document.getElementById('popover');
        if (!element?.contains(e.target as Node)) {
            dismiss();
        }
    };

    const onEscape = (e: KeyboardEvent) => {
        if (e.code === InteractionKeyCode.ESCAPE) {
            dismiss();
            targetElement.current.focus();
        }
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

    return (
        <>
            {open ? (
                <div
                    id="popover"
                    ref={popoverElement}
                    aria-label={ariaLabel}
                    className={classNames('popover popover-container', conditionalClasses())}
                    role={PopoverContainerAriaRole.POPOVER}
                >
                    {image && (
                        <div className="popover__image">
                            {dismissible && <PopoverDismissButton click={dismiss} />}
                            {image}
                        </div>
                    )}
                    {title && (
                        <div className={getModifierClasses('popover__header', 'popover__header', modifiers)}>
                            <div className={'popover__header-title'}>
                                {headerIcon ? { headerIcon } : null}
                                <PopoverTitle title={title} isImageTitle={Boolean(image)}></PopoverTitle>
                            </div>
                            {dismissible && !image && <PopoverDismissButton click={dismiss} />}
                        </div>
                    )}
                    {children && <div className="popover__content">{children}</div>}
                    {actions && (
                        <div className="popover__footer">
                            <ButtonActions actions={actions} layout={actionsLayout}></ButtonActions>
                        </div>
                    )}
                </div>
            ) : null}
        </>
    );
}
export default Popover;
