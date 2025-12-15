import { ComponentChildren, VNode } from 'preact';
import { CustomCell } from './DataGrid';
import { TranslationKey } from '../../../translations';
import { StringWithAutocompleteOptions } from '../../../utils/types';

export type CellTextPosition = 'center' | 'right' | 'left';

export interface DataGridColumn<Item> {
    label: string;
    key: StringWithAutocompleteOptions<Item>;
    position?: CellTextPosition;
    visible?: boolean;
    minWidth?: number;
    flex?: number;
}

export interface DataGridProps<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    ClickedField extends keyof Item[number],
    CustomCells extends CustomCell<Item, Columns, Columns[number]>,
> {
    autoFitColumns?: boolean;
    children?: ComponentChildren;
    columns: Columns;
    condensed: boolean;
    narrowColumns?: boolean;
    data: Item | undefined;
    loading: boolean;
    outline: boolean;
    scrollable: boolean;
    Footer?: any;
    onRowClick?: {
        callback: (
            value: Item[number][ClickedField] extends NonNullable<Item[number][ClickedField]> ? Item[number][ClickedField] : Item[number]
        ) => void;
        retrievedField?: ClickedField;
    };
    onRowHover?: (index?: number) => void;
    customCells?: CustomCells;
    emptyTableMessage?: {
        title: TranslationKey;
        message?: TranslationKey | TranslationKey[];
    };
    error?: Error | undefined;
    errorDisplay?: () => VNode<any>;
}

export interface InteractiveBodyProps<
    Items extends any[],
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string & {}>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>,
> {
    onRowClick?: DataGridProps<Items, Columns, ClickedField, CustomCells>['onRowClick'];
    data: DataGridProps<Items, Columns, ClickedField, CustomCells>['data'];
    columns: DataGridProps<Items, Columns, ClickedField, CustomCells>['columns'];
    customCells: DataGridProps<Items, Columns, ClickedField, CustomCells>['customCells'];
    onRowHover?: (index?: number) => void;
}

export interface DataGridContextProps {
    registerCells: (props: { column: string; width: number }) => void;
    getMinWidthByColumn: (column: string) => number | undefined;
}
