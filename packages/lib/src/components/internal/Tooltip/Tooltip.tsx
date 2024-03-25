import Popover from '@src/components/internal/Popover/Popover';
import { PopoverContainerVariant } from '@src/components/internal/Popover/types';
import { useTooltipListeners } from '@src/components/internal/Tooltip/useTooltipListeners';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { cloneElement, VNode } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { MutableRef } from 'preact/hooks';
import { TooltipProps } from './types';
import './Tooltip.scss';

const isString = (content: string | VNode<any>) => {
    return typeof content === 'string';
};

export const Tooltip = ({ content, children, triggerRef, showTooltip, position }: PropsWithChildren<TooltipProps>) => {
    const controllerRef = useUniqueIdentifier();

    const { isVisible, listeners } = useTooltipListeners();

    return (
        <>
            {children
                ? cloneElement(children, {
                      ...children?.props,
                      ref: controllerRef,
                      className: children?.props?.className
                          ? `${children?.props?.className} adyen-fp-web__tooltip-target`
                          : 'adyen-fp-web__tooltip-target',
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
