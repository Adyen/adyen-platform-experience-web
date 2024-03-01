import ButtonActions from '@src/components/internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '@src/components/internal/Button/ButtonActions/types';
import { isFunction } from '@src/utils/common';
import {
    DEFAULT_POPOVER_CLASSNAME,
    POPOVER_CONTAINER_CLASSNAME,
    POPOVER_CONTENT_CLASSNAME,
    POPOVER_FOOTER_CLASSNAME,
    POPOVER_HEADER_CLASSNAME,
    POPOVER_HEADER_TITLE_CLASSNAME,
} from '@src/components/internal/Popover/constants';
import PopoverDismissButton from '@src/components/internal/Popover/PopoverDismissButton/PopoverDismissButton';
import PopoverTitle from '@src/components/internal/Popover/PopoverTitle/PopoverTitle';
import { PopoverContainerPosition, PopoverContainerSize, PopoverContainerVariant, PopoverProps } from '@src/components/internal/Popover/types';
import { InteractionKeyCode } from '@src/components/types';
import { useClickOutside } from '@src/hooks/element/useClickOutside';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import usePopoverPositioner from '@src/hooks/element/usePopoverPositioner';
import { getModifierClasses } from '@src/utils/class-name-utils';
import { isFocusable, SELECTORS } from '@src/utils/tabbable';
import classNames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import './Popover.scss';
import './PopoverContainer.scss';
import useReflex from '@src/hooks/useReflex';

const findFirstFocusableElement = (root: Element) => {
    let focusable: HTMLElement | undefined;
    const elements = root.querySelector(`.${POPOVER_CONTENT_CLASSNAME}`)?.querySelectorAll(SELECTORS);
    Array.prototype.some.call(elements, elem => {
        if (isFocusable(elem)) return (focusable = elem);
    });
    return focusable;
};
function Popover({
    actions,
    disableFocusTrap = false,
    actionsLayout = ButtonActionsLayoutBasic.SPACE_BETWEEN,
    variant = PopoverContainerVariant.TOOLTIP,
    title,
    open,
    dismissible,
    modifiers,
    divider,
    fitContent,
    withoutSpace,
    containerSize,
    position,
    targetElement,
    dismiss,
    children,
    withContentPadding,
    ...uncontrolledProps
}: PropsWithChildren<PopoverProps>) {
    const isDismissible = useMemo(() => isFunction(dismiss) && dismissible !== false, [dismiss, dismissible]);

    const onCloseFocusTrap = useCallback(
        (interactionKeyPressed: boolean) => {
            dismiss && dismiss();
            if (interactionKeyPressed) {
                (targetElement?.current as HTMLElement)?.focus();
            }
        },
        [dismiss, targetElement]
    );

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.code === InteractionKeyCode.ESCAPE) {
                dismiss && dismiss();
                (targetElement?.current as HTMLElement).focus();
            }
        },
        [dismiss, targetElement]
    );

    const cachedOnKeyDown = useRef(onKeyDown);
    const autoFocusAnimFrame = useRef<ReturnType<typeof requestAnimationFrame>>();

    const popoverPositionAnchorElement = useClickOutside(
        usePopoverPositioner([0, 15], targetElement, variant, PopoverContainerPosition.BOTTOM),
        dismiss
    );
    const popoverFocusTrapElement = useFocusTrap(disableFocusTrap ? null : popoverPositionAnchorElement, onCloseFocusTrap);

    const popoverElement = useReflex<Element>(
        useCallback(current => {
            if (current instanceof Element) {
                cancelAnimationFrame(autoFocusAnimFrame.current!);

                autoFocusAnimFrame.current = requestAnimationFrame(() => {
                    const focusable = findFirstFocusableElement(current) as HTMLElement;
                    focusable?.focus();
                });
            }
        }, []),
        disableFocusTrap ? popoverPositionAnchorElement : popoverFocusTrapElement
    );

    const conditionalClasses = useMemo(
        () => ({
            [`${DEFAULT_POPOVER_CLASSNAME}--medium`]: containerSize === PopoverContainerSize.MEDIUM,
            [`${DEFAULT_POPOVER_CLASSNAME}--with-divider`]: !!divider,
            [`${DEFAULT_POPOVER_CLASSNAME}--wide`]: containerSize === PopoverContainerSize.WIDE,
            [`${DEFAULT_POPOVER_CLASSNAME}--fit-content`]: fitContent,
            [`${DEFAULT_POPOVER_CLASSNAME}--without-space`]: withoutSpace,
        }),
        [containerSize, divider, withoutSpace, fitContent]
    );

    useEffect(() => {
        document.removeEventListener('keydown', cachedOnKeyDown.current);
        document.addEventListener('keydown', (cachedOnKeyDown.current = onKeyDown));
        return () => document.removeEventListener('keydown', cachedOnKeyDown.current);
    }, [onKeyDown]);

    return (
        <>
            {open ? (
                <div
                    id="popover"
                    ref={popoverElement}
                    {...uncontrolledProps}
                    className={classNames(`${DEFAULT_POPOVER_CLASSNAME} ${POPOVER_CONTAINER_CLASSNAME}`, conditionalClasses)}
                    style={{ display: 'none' }}
                    role={uncontrolledProps.role ?? 'dialog'}
                >
                    {(title || isDismissible) && (
                        <div className={getModifierClasses(POPOVER_HEADER_CLASSNAME, modifiers, [POPOVER_HEADER_CLASSNAME])}>
                            {title && (
                                <div className={POPOVER_HEADER_TITLE_CLASSNAME}>
                                    <PopoverTitle title={title} />
                                </div>
                            )}
                            {isDismissible && <PopoverDismissButton onClick={dismiss!} />}
                        </div>
                    )}
                    {children && (
                        <div
                            className={
                                withContentPadding
                                    ? `${POPOVER_CONTENT_CLASSNAME} ${POPOVER_CONTENT_CLASSNAME}--with-padding`
                                    : POPOVER_CONTENT_CLASSNAME
                            }
                        >
                            {children}
                        </div>
                    )}
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
