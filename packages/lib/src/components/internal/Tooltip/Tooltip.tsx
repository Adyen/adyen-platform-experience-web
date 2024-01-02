import './Tooltip.scss';
import { TooltipProps } from './types';
import { TooltipContent } from '@src/components/internal/Tooltip/TooltipContent';
import cx from 'classnames';
import { render } from 'preact';
import { useEffect } from 'preact/hooks';
import { PropsWithChildren } from 'preact/compat';

export const Tooltip = ({ content, targetRef, children }: PropsWithChildren<TooltipProps>) => {
    useEffect(() => {
        const container = document.createElement('div');
        container.setAttribute('id', 'tooltip-container');
        document.body.appendChild(container);
        const Foo = () => <div>{'foo'}</div>;

        render(<Foo />, container);
    }, []);

    return (
        <div
            className={cx('adyen-fp-tooltip__container', {
                'adyen-fp-tooltip__container--hidden': !targetRef,
            })}
        >
            {targetRef && (
                <TooltipContent isVisible={true} content={content} controllerRef={targetRef}>
                    {children}
                </TooltipContent>
            )}
        </div>
    );
};
