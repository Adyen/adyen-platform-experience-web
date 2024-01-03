import './Tooltip.scss';
import { TooltipProps } from './types';
import { TooltipContent } from '@src/components/internal/Tooltip/TooltipContent';
import cx from 'classnames';
import { cloneElement } from 'preact';
import { createPortal, PropsWithChildren } from 'preact/compat';
import useUniqueIdentifier from '@src/hooks/element/useUniqueIdentifier';
import { useTooltipListeners } from '@src/components/internal/Tooltip/useTooltipListeners';

export const Tooltip = ({ content, children, triggerRef, showTooltip }: PropsWithChildren<TooltipProps>) => {
    const controllerRef = useUniqueIdentifier<HTMLElement>();

    const { isVisible, listeners } = useTooltipListeners({});
    return (
        <>
            {children
                ? cloneElement(children, {
                      ref: controllerRef,
                      ...listeners,
                      'aria-describedby': `tooltip-${controllerRef.current?.id}`,
                  })
                : null}

            {(isVisible || showTooltip) &&
                createPortal(
                    <div
                        className={cx('adyen-fp-tooltip__container', {
                            'adyen-fp-tooltip__container--hidden': !isVisible && !showTooltip,
                        })}
                    >
                        <TooltipContent isVisible={isVisible || Boolean(showTooltip)} content={content} controllerRef={triggerRef ?? controllerRef} />
                    </div>,
                    document.body
                )}
        </>
    );
};
