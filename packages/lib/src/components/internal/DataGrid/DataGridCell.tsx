export default function DataGridCell({ children, ...props }) {
    return (
        <td className="adyen-fp-data-grid__cell" {...props}>
            {children}
        </td>
    );
}
