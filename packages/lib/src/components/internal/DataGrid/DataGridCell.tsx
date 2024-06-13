import { HTMLAttributes, PropsWithChildren } from 'preact/compat';

export default function DataGridCell({ children, ...props }: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
    return (
        <div role="cell" className="adyen-pe-data-grid__cell" {...props}>
            {children}
        </div>
    );
}
