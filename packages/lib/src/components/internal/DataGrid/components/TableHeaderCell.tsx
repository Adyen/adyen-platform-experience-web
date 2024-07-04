import classnames from 'classnames';
import { CellTextPosition, DataGridColumn } from '../types';
import { useDataGridContext } from '../hooks/useDataGridContext';
import { useEffect, useRef } from 'preact/hooks';

export const TableHeaderCell = ({ cellKey, position, label }: DataGridColumn<Extract<string, string>> & { cellKey: string }) => {
    const { registerCells } = useDataGridContext();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            registerCells({
                column: cellKey,
                width: ref.current?.getBoundingClientRect().width,
            });
        }
    }, [cellKey, registerCells]);

    return (
        <div
            role="columnheader"
            id={String(cellKey)}
            className={classnames('adyen-pe-data-grid__cell adyen-pe-data-grid__cell--heading', {
                'adyen-pe-data-grid__cell--right': position === CellTextPosition.RIGHT,
                'adyen-pe-data-grid__cell--center': position === CellTextPosition.CENTER,
            })}
        >
            <div ref={ref} className={'adyen-pe-data-grid__cell--heading-content'}>
                {label}
            </div>
        </div>
    );
};
