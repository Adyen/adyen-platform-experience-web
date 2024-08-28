import { ComponentChildren, VNode } from 'preact';
import { CustomCell } from './DataGrid';
import { TranslationKey } from '../../../core/Localization/types';

export enum CellTextPosition {
    CENTER = 'center',
    RIGHT = 'right',
}

export interface DataGridColumn<Item> {
    label: string;
    key: Item | (string & {});
    position?: CellTextPosition;
    visible?: boolean;
    minWidth?: number;
    flex?: number;
}

export interface DataGridProps<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    ClickedField extends keyof Item[number],
    Fields extends Readonly<Array<string>>,
    CustomCells extends CustomCell<Item, Columns, Columns[number], Fields>
> {
    fields: Fields;
    children?: ComponentChildren;
    columns: Columns;
    condensed: boolean;
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
    Fields extends Readonly<Array<string>>,
    CustomCells extends CustomCell<Items, Columns, Columns[number], Fields>
> {
    onRowClick?: DataGridProps<Items, Columns, ClickedField, Fields, CustomCells>['onRowClick'];
    data: DataGridProps<Items, Columns, ClickedField, Fields, CustomCells>['data'];
    columns: DataGridProps<Items, Columns, ClickedField, Fields, CustomCells>['columns'];
    customCells: DataGridProps<Items, Columns, ClickedField, Fields, CustomCells>['customCells'];
    onRowHover?: (index?: number) => void;
}

export interface DataGridContextProps {
    registerCells: (props: { column: string; width: number }) => void;
    getMinWidthByColumn: (column: string) => number | undefined;
}
