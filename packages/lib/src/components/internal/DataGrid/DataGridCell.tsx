export default function DataGridCell({ children, ...props }) {
    return (
        <td class="adyen-fp-data-grid__cell" {...props}>
            {children}
        </td>
    );
}