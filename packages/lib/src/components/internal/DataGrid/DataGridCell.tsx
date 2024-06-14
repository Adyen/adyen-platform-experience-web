import { HTMLAttributes, PropsWithChildren } from 'preact/compat';
import { useDataGridContext } from './hooks/useDataGridContext';
import { useEffect, useRef } from 'preact/hooks';
import { cloneElement, isValidElement } from 'preact';

export default function DataGridCell({ children, column, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>> & { column: string }) {
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
        <div role="cell" className="adyen-pe-data-grid__cell" {...props}>
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
