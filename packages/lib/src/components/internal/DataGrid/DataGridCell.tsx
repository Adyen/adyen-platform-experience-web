import { HTMLAttributes, PropsWithChildren } from 'preact/compat';

export default function DataGridCell({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLTableCellElement>>) {
    return (
        <td class="adyen-fp-data-grid__cell" {...props}>
            {children}
        </td>
    );
}
