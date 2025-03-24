import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import { useDataGridContext } from './hooks/useDataGridContext';
import { useEffect, useRef } from 'preact/hooks';
import { cloneElement, isValidElement } from 'preact';
import cx from 'classnames';
import { CellTextPosition } from './types';

export default function DataGridCell({
    children,
    column,
    position,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>> & { column: string; position?: string }) {
    const { registerCells } = useDataGridContext();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            registerCells({
                column,
                width: ref.current?.getBoundingClientRect().width,
            });
        }
    }, [column, registerCells]);

    return (
        <div
            role="cell"
            className={cx('adyen-pe-data-grid__cell', {
                'adyen-pe-data-grid__cell--right': position === 'right',
                'adyen-pe-data-grid__cell--center': position === 'center',
            })}
            {...props}
        >
            {children && isValidElement(children)
                ? cloneElement(children, {
                      ...children?.props,
                      ref: ref,
                      style: { width: 'min-content' },
                  })
                : null}
        </div>
    );
}
