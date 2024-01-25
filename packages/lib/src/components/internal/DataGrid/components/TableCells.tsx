import DataGridCell from '@src/components/internal/DataGrid/DataGridCell';

export const TableCells = ({ columns, customCells, item }: { columns: any[]; customCells: any; item: any }) => {
    return (
        <>
            {columns.map(({ key }) => {
                if (customCells?.[key])
                    return (
                        <DataGridCell aria-labelledby={String(key)} key={key}>
                            {customCells[key]({
                                key,
                                value: item[key],
                                item,
                            })}
                        </DataGridCell>
                    );

                return (
                    <DataGridCell aria-labelledby={String(key)} key={key}>
                        {item[key]}
                    </DataGridCell>
                );
            })}
        </>
    );
};
