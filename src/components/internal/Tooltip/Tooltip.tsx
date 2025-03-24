import Popover from '../Popover/Popover';
import { PopoverContainerVariant } from '../Popover/types';
import { useTooltipListeners } from './useTooltipListeners';
import { TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import useUniqueIdentifier from '../../../hooks/element/useUniqueIdentifier';
import classNames from 'classnames';
import { cloneElement, VNode } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { MutableRef } from 'preact/hooks';
import { TooltipProps } from './types';
import './Tooltip.scss';

const isString = (content: string | VNode<any>) => {
    return typeof content === 'string';
};

function isTouchDevice() {
    const hasTouchStart = 'ontouchstart' in window;

    // Check for maximum touch points (standard and IE)
    const hasTouchPoints =
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
        ((navigator as any).msMaxTouchPoints && (navigator as any).msMaxTouchPoints > 0);

    const hasCoarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

    return hasTouchStart || hasTouchPoints || hasCoarsePointer;
}

export const Tooltip = ({ content, children, triggerRef, showTooltip, position, isContainerHovered = false }: PropsWithChildren<TooltipProps>) => {
    const controllerRef = useUniqueIdentifier();
    const { isVisible, listeners } = useTooltipListeners();

    if (isTouchDevice()) return <>{children}</>;

    return (
        <>
            {children
                ? cloneElement(children, {
                      ...children?.props,
                      role: 'button',
                      tabIndex: -1,
                      ref: controllerRef,
                      className: children?.props?.className
                          ? classNames(`${children?.props?.className} adyen-pe__tooltip-target`, {
                                ' adyen-pe__tooltip-target--hovered': isContainerHovered,
                            })
                          : classNames('adyen-pe__tooltip-target', { 'adyen-pe__tooltip-target--hovered': isContainerHovered }),
                      ...listeners,
                      'aria-describedby': `tooltip-${controllerRef.current?.id}`,
                  })
                : null}

            {(isVisible || showTooltip) && (
                <Popover
                    variant={PopoverContainerVariant.TOOLTIP}
                    targetElement={(triggerRef ?? controllerRef) as MutableRef<Element | null>}
                    position={position}
                    open={isVisible || showTooltip}
                >
                    <>{content && isString(content) ? <Typography variant={TypographyVariant.CAPTION}>{content}</Typography> : { content }}</>
                </Popover>
            )}
        </>
    );
};
