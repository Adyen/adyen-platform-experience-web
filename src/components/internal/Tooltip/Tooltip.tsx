import Popover from '../Popover/Popover';
import { PopoverContainerVariant } from '../Popover/types';
import { useTooltipListeners } from './useTooltipListeners';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import Typography from '../Typography/Typography';
import useUniqueIdentifier from '../../../hooks/element/useUniqueIdentifier';
import classNames from 'classnames';
import { cloneElement, VNode } from 'preact';
import { PropsWithChildren } from 'preact/compat';
import { MutableRef, useMemo, useState } from 'preact/hooks';
import { TooltipProps } from './types';
import './Tooltip.scss';

const isString = (content: string | VNode<any>) => {
    return typeof content === 'string';
};

export const Tooltip = ({ content, children, showTooltip, position, showUnderline = false }: PropsWithChildren<TooltipProps>) => {
    const [popoverElement, setPopoverElement] = useState<HTMLDivElement | null>(null);
    const { isVisible, listeners } = useTooltipListeners();
    const targetElementRef = useUniqueIdentifier();
    const canShowTooltip = isVisible || !!showTooltip;

    const targetClassName = useMemo(
        () => classNames(children?.props?.className, 'adyen-pe-tooltip-target', { 'adyen-pe-tooltip-target--underlined': showUnderline }),
        [children?.props?.className, showUnderline]
    );

    return (
        <>
            {children
                ? cloneElement(children, {
                      ...children.props,
                      ...listeners,
                      ...(canShowTooltip && popoverElement?.id ? { 'aria-describedby': popoverElement.id } : {}),
                      className: targetClassName,
                      ref: targetElementRef,
                      role: 'button',
                      tabIndex: 0,
                  })
                : null}

            {canShowTooltip && (
                <Popover
                    position={position}
                    variant={PopoverContainerVariant.TOOLTIP}
                    targetElement={targetElementRef as MutableRef<Element | null>}
                    setPopoverElement={setPopoverElement}
                    fitPosition
                    open
                >
                    {content && isString(content) ? (
                        <Typography el={TypographyElement.DIV} variant={TypographyVariant.CAPTION}>
                            {content}
                        </Typography>
                    ) : (
                        content
                    )}
                </Popover>
            )}
        </>
    );
};
