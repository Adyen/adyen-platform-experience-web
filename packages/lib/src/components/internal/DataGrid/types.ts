import { ComponentChildren } from 'preact';
import { CustomCell } from '@src/components/internal/DataGrid/DataGrid';
import { TranslationKey } from '@src/core/Localization/types';

export enum CellTextPosition {
    CENTER = 'center',
    RIGHT = 'right',
}

export interface DataGridColumn<Item> {
    label: string;
    key: Item | string;
    position?: CellTextPosition;
}

export interface DataGridProps<
    Item extends Array<any>,
    Columns extends Array<DataGridColumn<Extract<keyof Item[number], string>>>,
    ClickedField extends keyof Item[number],
    CustomCells extends CustomCell<Item, Columns, Columns[number]>
> {
    children?: ComponentChildren;
    columns: Columns;
    condensed: boolean;
    data: Item | undefined;
    loading: boolean;
    outline: boolean;
    scrollable: boolean;
    Footer?: any;
    onRowClick?: { retrievedField: ClickedField; callback: (value: Item[0][ClickedField]) => void };
    customCells?: CustomCells;
    emptyTableMessage?: {
        title: TranslationKey;
        message?: TranslationKey;
    };
}

export interface InteractiveBodyProps<
    Items extends any[],
    Columns extends Array<DataGridColumn<Extract<keyof Items[number], string>>>,
    ClickedField extends keyof Items[number],
    CustomCells extends CustomCell<Items, Columns, Columns[number]>
> {
    onRowClick: DataGridProps<Items, Columns, ClickedField, CustomCells>['onRowClick'];
    data: DataGridProps<Items, Columns, ClickedField, CustomCells>['data'];
    columns: DataGridProps<Items, Columns, ClickedField, CustomCells>['columns'];
    customCells: DataGridProps<Items, Columns, ClickedField, CustomCells>['customCells'];
}
