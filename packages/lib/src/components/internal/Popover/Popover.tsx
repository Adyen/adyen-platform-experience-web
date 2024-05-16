import ButtonActions from '../Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '../Button/ButtonActions/types';
import {
    DEFAULT_POPOVER_CLASSNAME,
    DEFAULT_TOOLTIP_CLASSNAME,
    POPOVER_CONTAINER_CLASSNAME,
    POPOVER_CONTENT_CLASSNAME,
    POPOVER_FOOTER_CLASSNAME,
    POPOVER_HEADER_CLASSNAME,
    POPOVER_HEADER_TITLE_CLASSNAME,
    TOOLTIP_CONTENT_CLASSNAME,
} from './constants';
import PopoverDismissButton from './PopoverDismissButton/PopoverDismissButton';
import PopoverTitle from './PopoverTitle/PopoverTitle';
import { PopoverContainerSize, PopoverContainerVariant, PopoverProps } from './types';
import { InteractionKeyCode } from '../../types';
import { ClickOutsideVariant, useClickOutside } from '../../../hooks/element/useClickOutside';
import useFocusTrap from '../../../hooks/element/useFocusTrap';
import usePopoverPositioner from '../../../hooks/element/usePopoverPositioner';
import useUniqueIdentifier from '../../../hooks/element/useUniqueIdentifier';
import useReflex from '../../../hooks/useReflex';
import { getModifierClasses } from '../../../utils/preact';
import { boolOrTrue, isFunction } from '../../../utils';
import { isFocusable, SELECTORS } from '../../../primitives/dom/tabbableRoot/tabbable';
import classNames from 'classnames';
import { createPortal, PropsWithChildren } from 'preact/compat';
import { Ref, useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import './Popover.scss';

const findFirstFocusableElement = (root: Element) => {
    let focusable: HTMLElement | undefined;
    const elements = root.querySelector(`.${TOOLTIP_CONTENT_CLASSNAME}`)?.querySelectorAll(SELECTORS);
    if (elements) {
        Array.prototype.some.call(elements, elem => {
            if (isFocusable(elem)) return (focusable = elem);
        });
        return focusable;
    }
    return null;
};

const getGapByVariant = (variant: PopoverContainerVariant): [number, number, number, number] => {
    return variant === PopoverContainerVariant.TOOLTIP ? [10, 3, 5, 5] : [15, 15, 15, 15];
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
    setToTargetWidth,
    dismiss,
    children,
    withContentPadding,
    classNameModifiers,
    showOverlay = false,
    fitPosition,
    ...uncontrolledProps
}: PropsWithChildren<PopoverProps>) {
    const isDismissible = useMemo(() => isFunction(dismiss) && boolOrTrue(dismissible), [dismiss, dismissible]);
    const arrowRef = useUniqueIdentifier() as Ref<HTMLSpanElement> | undefined;
    const popoverOpen = useRef<boolean>();

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
        usePopoverPositioner(getGapByVariant(variant), targetElement, variant, position, arrowRef, setToTargetWidth, showOverlay, fitPosition),
        dismiss,
        variant === PopoverContainerVariant.TOOLTIP && !open,
        ClickOutsideVariant.POPOVER
    );
    const popoverFocusTrapElement = useFocusTrap(disableFocusTrap ? null : popoverPositionAnchorElement, onCloseFocusTrap);

    const popoverElement = useReflex<Element>(
        useCallback(
            current => {
                if (current instanceof Element) {
                    cancelAnimationFrame(autoFocusAnimFrame.current!);

                    autoFocusAnimFrame.current = requestAnimationFrame(() => {
                        if (popoverOpen.current === open) return;
                        if (!(popoverOpen.current = open)) return;
                        const focusable = findFirstFocusableElement(current) as HTMLElement;
                        focusable?.focus();
                    });
                }
            },
            [open]
        ),
        disableFocusTrap ? popoverPositionAnchorElement : popoverFocusTrapElement
    );

    const popoverElementWithId = useUniqueIdentifier(popoverElement);

    const conditionalClasses = useMemo(
        () => ({
            [`${DEFAULT_POPOVER_CLASSNAME}--medium`]: containerSize === PopoverContainerSize.MEDIUM,
            [`${DEFAULT_POPOVER_CLASSNAME}--with-divider`]: !!divider,
            [`${DEFAULT_POPOVER_CLASSNAME}--wide`]: containerSize === PopoverContainerSize.WIDE,
            [`${DEFAULT_POPOVER_CLASSNAME}--fit-content`]: fitContent,
            [`${DEFAULT_POPOVER_CLASSNAME}--without-space`]: withoutSpace,
            [`${DEFAULT_POPOVER_CLASSNAME}--auto-width`]: showOverlay,
        }),
        [containerSize, divider, withoutSpace, fitContent, showOverlay]
    );

    useEffect(() => {
        document.removeEventListener('keydown', cachedOnKeyDown.current);
        document.addEventListener('keydown', (cachedOnKeyDown.current = onKeyDown));
        return () => document.removeEventListener('keydown', cachedOnKeyDown.current);
    }, [onKeyDown]);

    const classNamesByVariant =
        variant === PopoverContainerVariant.TOOLTIP ? DEFAULT_TOOLTIP_CLASSNAME : `${DEFAULT_POPOVER_CLASSNAME} ${POPOVER_CONTAINER_CLASSNAME}`;
    const classNamesContentByVariant = variant === PopoverContainerVariant.TOOLTIP ? TOOLTIP_CONTENT_CLASSNAME : `${POPOVER_CONTENT_CLASSNAME}`;

    return createPortal(
        <>
            {open ? (
                <>
                    {showOverlay && <div className="adyen-pe-popover__overlay"></div>}
                    <div
                        id="popover"
                        ref={popoverElementWithId}
                        {...uncontrolledProps}
                        className={classNames(classNamesByVariant, conditionalClasses, classNameModifiers)}
                        style={{ visibility: 'hidden' }}
                        role={uncontrolledProps.role ?? (variant === PopoverContainerVariant.POPOVER ? 'dialog' : 'tooltip')}
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
                            <>
                                <div
                                    className={classNames(classNamesContentByVariant, {
                                        [`${POPOVER_CONTENT_CLASSNAME}--with-padding`]: withContentPadding,
                                        [`${POPOVER_CONTENT_CLASSNAME}--overlay`]: showOverlay,
                                    })}
                                >
                                    {children}
                                </div>
                                {variant === PopoverContainerVariant.TOOLTIP && (
                                    <span data-popover-placement="hidden" ref={arrowRef} className="adyen-pe-tooltip__arrow" />
                                )}
                            </>
                        )}
                        {actions && (
                            <div className={POPOVER_FOOTER_CLASSNAME}>
                                <ButtonActions actions={actions} layout={actionsLayout} />
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </>,
        document.getElementsByTagName('body')[0]!
    );
}
export default Popover;
