import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import { useDataGridContext } from './hooks/useDataGridContext';
import { cloneElement, isValidElement } from 'preact';
import { useCallback } from 'preact/hooks';
import cx from 'classnames';

export default function DataGridCell({
    children,
    column,
    position,
    ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>> & { column: string; position?: string }) {
    const { registerCells } = useDataGridContext();

    const cellMeasureRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (!node) return;
            const { width } = node.getBoundingClientRect();
            registerCells({ column, width });
        },
        [column, registerCells]
    );

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
                      ref: cellMeasureRef,
                      style: { width: 'min-content' },
                  })
                : null}
        </div>
    );
}
