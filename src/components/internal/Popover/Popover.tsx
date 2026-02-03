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
import { ClickOutsideVariant, CONTROL_ELEMENT_PROPERTY, useClickOutside } from '../../../hooks/element/useClickOutside';
import useCoreContext from '../../../core/Context/useCoreContext';
import useFocusTrap from '../../../hooks/element/useFocusTrap';
import usePopoverPositioner from '../../../hooks/element/usePopoverPositioner';
import useUniqueIdentifier from '../../../hooks/element/useUniqueIdentifier';
import useReflex from '../../../hooks/useReflex';
import { getModifierClasses } from '../../../utils/preact';
import { boolOrTrue, isFunction } from '../../../utils';
import { isFocusable, SELECTORS } from '../../../primitives/dom/tabbableRoot/tabbable';
import classNames from 'classnames';
import { createPortal, PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo, useRef } from 'preact/hooks';
import { Ref } from 'preact';
import './Popover.scss';

const findFirstFocusableElement = (root: Element) => {
    let focusable: HTMLElement | undefined;
    const elements = root.querySelector(`:scope .${TOOLTIP_CONTENT_CLASSNAME}`)?.querySelectorAll(SELECTORS);
    if (elements) {
        Array.prototype.some.call(elements, elem => {
            if (isFocusable(elem)) return (focusable = elem);
        });
        return focusable;
    }
    return null;
};

const getGapByVariant = (variant: PopoverContainerVariant): [number, number, number, number] => {
    return variant === PopoverContainerVariant.TOOLTIP ? [10, 3, 5, 5] : [8, 8, 8, 8];
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
    fixedPositioning = false,
    additionalStyle,
    setPopoverElement,
    ...uncontrolledProps
}: PropsWithChildren<PopoverProps>) {
    const isDismissible = useMemo(() => isFunction(dismiss) && boolOrTrue(dismissible), [dismiss, dismissible]);
    const arrowRef = useUniqueIdentifier() as Ref<HTMLSpanElement> | undefined;
    const contentRef = useUniqueIdentifier() as Ref<HTMLDivElement> | undefined;
    const { theme } = useCoreContext();
    const isDarkTheme = theme === 'dark';
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
        usePopoverPositioner(
            getGapByVariant(variant),
            targetElement,
            variant,
            position,
            arrowRef,
            setToTargetWidth,
            showOverlay,
            fitPosition,
            fixedPositioning,
            additionalStyle,
            undefined,
            contentRef
        ),
        dismiss,
        variant === PopoverContainerVariant.TOOLTIP && !open,
        ClickOutsideVariant.POPOVER
    );

    const popoverFocusTrapElement = useFocusTrap(disableFocusTrap ? null : popoverPositionAnchorElement, onCloseFocusTrap);

    const popoverElement = useReflex<Element & { [CONTROL_ELEMENT_PROPERTY]?: (typeof targetElement)['current'] }>(
        useCallback(
            (current, previous) => {
                if (previous instanceof Element) {
                    previous[CONTROL_ELEMENT_PROPERTY] = undefined;
                    delete previous[CONTROL_ELEMENT_PROPERTY];
                }
                if (current instanceof Element) {
                    current[CONTROL_ELEMENT_PROPERTY] = targetElement.current;
                    cancelAnimationFrame(autoFocusAnimFrame.current!);

                    autoFocusAnimFrame.current = requestAnimationFrame(() => {
                        if (popoverOpen.current === open) return;
                        if (!(popoverOpen.current = open)) return;
                        const focusable = findFirstFocusableElement(current) as HTMLElement;
                        focusable?.focus();
                    });
                }
            },
            [open, targetElement]
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
        if (popoverElement.current) popoverElement.current[CONTROL_ELEMENT_PROPERTY] = targetElement.current;
    }, [popoverElement, targetElement]);

    useEffect(() => {
        document.removeEventListener('keydown', cachedOnKeyDown.current);
        document.addEventListener('keydown', (cachedOnKeyDown.current = onKeyDown));
        return () => document.removeEventListener('keydown', cachedOnKeyDown.current);
    }, [onKeyDown]);

    const classNamesByVariant =
        variant === PopoverContainerVariant.TOOLTIP
            ? `${DEFAULT_TOOLTIP_CLASSNAME}${isDarkTheme ? ` ${DEFAULT_TOOLTIP_CLASSNAME}--dark` : ''}`
            : `${DEFAULT_POPOVER_CLASSNAME} ${POPOVER_CONTAINER_CLASSNAME}${isDarkTheme ? ` ${DEFAULT_POPOVER_CLASSNAME}--dark` : ''}`;
    const classNamesContentByVariant = variant === PopoverContainerVariant.TOOLTIP ? TOOLTIP_CONTENT_CLASSNAME : `${POPOVER_CONTENT_CLASSNAME}`;

    return createPortal(
        <>
            {open ? (
                <>
                    {showOverlay && <div className="adyen-pe-popover__overlay"></div>}
                    <div
                        {...uncontrolledProps}
                        ref={elem => {
                            popoverElementWithId(elem);
                            setPopoverElement?.(elem);
                        }}
                        aria-labelledby={targetElement.current?.id}
                        className={classNames(classNamesByVariant, conditionalClasses, classNameModifiers)}
                        role={variant === PopoverContainerVariant.POPOVER ? 'dialog' : 'tooltip'}
                        style={{ visibility: 'hidden' }}
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
                                    ref={contentRef}
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
