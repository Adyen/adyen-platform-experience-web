import { ComponentChild, ComponentChildren } from 'preact';

export enum CellTextPosition {
    CENTER = 'center',
    RIGHT = 'right',
}

export interface DataGridColumn<Item> {
    label: string;
    key: keyof Item;
    position?: CellTextPosition;
}

export interface DataGridProps<Item extends Array<any>, ClickedField extends keyof Item[number]> {
    children: ComponentChildren;
    columns: DataGridColumn<Item[number]>[];
    condensed: boolean;
    data: Item;
    loading: boolean;
    outline: boolean;
    scrollable: boolean;
    Footer?: any;
    onRowClick?: { retrievedField: ClickedField; callback: (value: Item[0][ClickedField]) => void };
    customCells?: {
        [k in keyof Partial<Item[number]>]: ({ key, value, item }: { key: k; value: Item[number][k]; item: Item[number] }) => ComponentChild;
    };
}

export interface InteractiveBodyProps<Items extends any[], ClickedField extends keyof Items[number]> {
    onRowClick: DataGridProps<Items, ClickedField>['onRowClick'];
    data: DataGridProps<Items, ClickedField>['data'];
    columns: DataGridProps<Items, ClickedField>['columns'];
    customCells: DataGridProps<Items, ClickedField>['customCells'];
}
