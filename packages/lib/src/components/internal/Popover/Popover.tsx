import ButtonActions from '@src/components/internal/Button/ButtonActions/ButtonActions';
import { ButtonActionsLayoutBasic } from '@src/components/internal/Button/ButtonActions/types';
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
import { useClickOutside } from '@src/hooks/element/useClickOutside';
import { InteractionKeyCode } from '@src/components/types';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import usePopoverPositioner from '@src/hooks/element/usePopoverPositioner';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { getModifierClasses } from '@src/utils/class-name-utils';
import { isFocusable } from '@src/utils/tabbable';
import classNames from 'classnames';
import { PropsWithChildren } from 'preact/compat';
import { useCallback, useEffect, useMemo } from 'preact/hooks';
import './Popover.scss';
import './PopoverContainer.scss';

const findFirstFocusableElement = () => {
    const focusable = Array.from(document.getElementsByClassName(`${DEFAULT_POPOVER_CLASSNAME}__content`)?.[0]?.children ?? []);
    return focusable.find(item => {
        return isFocusable(item);
    });
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
    const focusTarget = useUniqueIdentifier();

    const onCloseFocusTrap = useCallback(
        (interactionKeyPressed: boolean) => {
            dismiss && dismiss();
            if (interactionKeyPressed) {
                (targetElement?.current as HTMLElement)?.focus();
            }
        },
        [dismiss, targetElement]
    );

    const popoverElement = useClickOutside(usePopoverPositioner([0, 15], targetElement, variant, PopoverContainerPosition.BOTTOM), dismiss);

    const focusTrap = useFocusTrap(focusTarget, onCloseFocusTrap, disableFocusTrap);

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

    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.code === InteractionKeyCode.ESCAPE) {
                dismiss && dismiss();
                (targetElement?.current as HTMLElement).focus();
            }
        },
        [dismiss, targetElement]
    );

    useEffect(() => {
        const focusable = findFirstFocusableElement() as HTMLElement;
        focusable?.focus();
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('keydown', onKeyDown);
        };
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
                    <div ref={focusTarget}>
                        <div ref={focusTrap}>
                            {title && (
                                <div className={getModifierClasses(POPOVER_HEADER_CLASSNAME, modifiers, [POPOVER_HEADER_CLASSNAME])}>
                                    <div className={POPOVER_HEADER_TITLE_CLASSNAME}>
                                        <PopoverTitle title={title} />
                                    </div>
                                    {dismissible && dismiss && <PopoverDismissButton onClick={dismiss} />}
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
                    </div>
                </div>
            ) : null}
        </>
    );
}
export default Popover;
