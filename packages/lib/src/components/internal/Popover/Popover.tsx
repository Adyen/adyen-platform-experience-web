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
import { useClickOutside } from '@src/components/internal/Popover/useClickOutside';
import { InteractionKeyCode } from '@src/components/types';
import useFocusTrap from '@src/hooks/element/useFocusTrap';
import usePopoverPositioner from '@src/hooks/element/usePopoverPositioner';
import { getModifierClasses } from '@src/utils/class-name-utils';
import { isFocusable } from '@src/utils/tabbable';
import classNames from 'classnames';
import { ComponentChildren } from 'preact';
import { MutableRef, useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import './Popover.scss';
import './PopoverContainer.scss';

interface PopoverCoreProps {
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
    targetElement: MutableRef<Element | null>;
    withoutSpace?: boolean;
    image?: Node;
    headerIcon?: Node;
    dismiss?: () => any;
    children: ComponentChildren;
}

type UncontrolledProps = Pick<HTMLAttributes<any>, 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'role'>;

type PopoverProps = PopoverCoreProps & UncontrolledProps;

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
    title,
    open,
    dismissible,
    modifiers,
    image,
    divider,
    fitContent,
    withoutSpace,
    containerSize,
    headerIcon,
    position,
    targetElement,
    dismiss,
    children,
    ...uncontrolledProps
}: PropsWithChildren<PopoverProps>) {
    const focusTrapElement = useRef(null);

    const onCloseFocusTrap = useCallback((interactionKeyPressed: boolean) => {
        dismiss && dismiss();
        if (interactionKeyPressed) {
            (targetElement?.current as HTMLElement)?.focus();
        }
    }, []);

    const popoverElement = useClickOutside(usePopoverPositioner([0, 15], targetElement), dismiss);

    if (!disableFocusTrap) {
        useFocusTrap(focusTrapElement, onCloseFocusTrap);
    }

    const conditionalClasses = useMemo(
        () => ({
            [`${DEFAULT_POPOVER_CLASSNAME}--small`]: containerSize === PopoverContainerSize.SMALL,
            [`${DEFAULT_POPOVER_CLASSNAME}--with-divider`]: !!divider,
            [`${DEFAULT_POPOVER_CLASSNAME}--large`]: containerSize === PopoverContainerSize.LARGE,
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

    const onClick = (e: any) => {
        if (!e.target.isFocusable()) {
            e.stopImmediatePropagation();
        }
    };

    return (
        <>
            {open ? (
                <div
                    id="popover"
                    ref={popoverElement}
                    {...uncontrolledProps}
                    className={classNames(`${DEFAULT_POPOVER_CLASSNAME} ${POPOVER_CONTAINER_CLASSNAME}`, conditionalClasses)}
                    style={{ display: 'none' }}
                    onClickCapture={onClick}
                    role={PopoverContainerAriaRole.POPOVER}
                >
                    <div ref={focusTrapElement}>
                        <div>
                            {image && (
                                <div className={POPOVER_IMAGE_CLASSNAME}>
                                    {dismissible && dismiss && <PopoverDismissButton onClick={dismiss} />}
                                    {image}
                                </div>
                            )}
                            {title && (
                                <div className={getModifierClasses(POPOVER_HEADER_CLASSNAME, modifiers, [POPOVER_HEADER_CLASSNAME])}>
                                    <div className={POPOVER_HEADER_TITLE_CLASSNAME}>
                                        {headerIcon ? { headerIcon } : null}
                                        <PopoverTitle title={title} isImageTitle={Boolean(image)} />
                                    </div>
                                    {dismissible && dismiss && !image && <PopoverDismissButton onClick={dismiss} />}
                                </div>
                            )}
                            {children && <div className={POPOVER_CONTENT_CLASSNAME}>{children}</div>}
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
