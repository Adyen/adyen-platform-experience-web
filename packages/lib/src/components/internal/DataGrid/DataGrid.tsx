import { ComponentChild, ComponentChildren, toChildArray } from 'preact';
import classnames from 'classnames';
import Spinner from '../Spinner';
import DataGridCell from './DataGridCell';
import './DataGrid.scss';
import { useCallback, useMemo, useReducer } from 'preact/hooks';
import useReflex from '@src/hooks/useReflex';
import { InteractionKeyCode } from '@src/components/types';

export enum CellTextPosition {
    CENTER = 'center',
    RIGHT = 'right',
}

interface DataGridColumn<Item> {
    label: string;
    key: keyof Item;
    position?: CellTextPosition;
}

interface DataGridProps<Item extends Array<any>, ClickedField extends keyof Item[number]> {
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

export const INITIAL_STATE = Object.freeze({
    activeIndex: -1,
    index: -1,
});

function DataGrid<Items extends Array<any>, ClickedField extends keyof Items[number]>(props: DataGridProps<Items, ClickedField>) {
    const children = toChildArray(props.children);
    const footer = children.find((child: ComponentChild) => (child as any)?.['type'] === DataGridFooter);

    return (
        <div
            className={classnames('adyen-fp-data-grid', {
                'adyen-fp-data-grid--condensed': props.condensed,
                'adyen-fp-data-grid--outline': props.outline,
                'adyen-fp-data-grid--scrollable': props.scrollable,
                'adyen-fp-data-grid--loading': props.loading,
            })}
        >
            {props.loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="adyen-fp-data-grid__table-wrapper">
                        <table className="adyen-fp-data-grid__table">
                            <thead className="adyen-fp-data-grid__head">
                                <tr role="rowheader" className="adyen-fp-data-grid__row">
                                    {props.columns.map(item => (
                                        <th
                                            role="columnheader"
                                            id={String(item.key)}
                                            className={classnames('adyen-fp-data-grid__cell adyen-fp-data-grid__cell--heading', {
                                                'adyen-fp-data-grid__cell--right': item.position === CellTextPosition.RIGHT,
                                                'adyen-fp-data-grid__cell--center': item.position === CellTextPosition.CENTER,
                                            })}
                                            key={item.key}
                                        >
                                            {item.label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <DataGridBody<Items, ClickedField> {...props} />
                        </table>
                    </div>
                    {footer}
                </>
            )}
        </div>
    );
}

function DataGridBody<Items extends Array<any>, ClickedField extends keyof Items[number]>(props: DataGridProps<Items, ClickedField>) {
    const classNames = useMemo(
        () => classnames('adyen-fp-data-grid__row', { 'adyen-fp-data-grid--clickable-row': Boolean(props.onRowClick) }),
        [props.onRowClick]
    );
    const onClickCallBack = useCallback(
        (item: Items[number]) => () => props.onRowClick?.retrievedField && props.onRowClick?.callback?.(item[props.onRowClick.retrievedField]),
        [props.onRowClick]
    );
    const handleOnClick = useMemo(() => (props.onRowClick ? onClickCallBack : undefined), [onClickCallBack, props.onRowClick]);

    const [state, dispatch] = useReducer<Readonly<{ activeIndex: number; index: number }>, { type: 'NEXT'; index?: number; activeIndex?: number }>(
        (currentState, action) => {
            switch (action.type) {
                case 'NEXT': {
                    const total = props.data.length;

                    if (total > 1) {
                        const current = currentState.index;
                        const nextIndex = action.index;

                        if (nextIndex === undefined) return currentState;

                        if ((nextIndex < total && nextIndex! >= 0) || (current === 0 && nextIndex > 0)) {
                            return Object.freeze({ ...currentState, index: action.index ?? 0, activeIndex: action.activeIndex ?? -1 });
                        }
                    }
                    return currentState;
                }
                default:
                    return currentState;
            }
        },
        INITIAL_STATE
    );

    const cursor = useReflex<Element>(
        useCallback(
            current => {
                if (!(current instanceof Element)) return;

                const optionIndex = Number((current as HTMLElement).dataset?.index);

                if ((state.activeIndex === -1 && optionIndex === 0) || optionIndex === state.index) {
                    current.setAttribute('tabindex', '0');
                } else {
                    current.setAttribute('tabindex', '-1');
                }
                if (optionIndex === state.activeIndex) {
                    (current as HTMLElement)?.focus();
                }
            },
            [state.activeIndex, state.index]
        )
    );

    const onKeyDownCapture = useCallback(
        (evt: KeyboardEvent) => {
            const isRow = (evt.target as HTMLElement)?.localName === 'tr';
            if (!isRow) {
                if (evt.code === InteractionKeyCode.ARROW_LEFT) {
                    dispatch({
                        type: 'NEXT',
                        index: state.index,
                        activeIndex: state.index,
                    });
                }
                return;
            }
            switch (evt.code) {
                case InteractionKeyCode.ARROW_DOWN:
                case InteractionKeyCode.ARROW_UP:
                    dispatch({
                        type: 'NEXT',
                        index: evt.code === InteractionKeyCode.ARROW_DOWN ? state.index + 1 : state.index - 1,
                        activeIndex: evt.code === InteractionKeyCode.ARROW_DOWN ? state.index + 1 : state.index - 1,
                    });
                    break;
                case InteractionKeyCode.HOME:
                    dispatch({
                        type: 'NEXT',
                        index: 0,
                        activeIndex: 0,
                    });
                    break;
                case InteractionKeyCode.END:
                    dispatch({
                        type: 'NEXT',
                        index: props.data.length - 1,
                        activeIndex: props.data.length - 1,
                    });
                    break;
                case InteractionKeyCode.ENTER:
                    (evt.currentTarget as HTMLElement)?.click();
                    break;
                default:
                    return;
            }
            evt.stopPropagation();
        },

        [props.data.length, state.index]
    );

    return (
        <tbody className="adyen-fp-data-grid__body">
            {props.data.map((item, index) => (
                <tr
                    onFocusCapture={evt => {
                        if (state.index === -1) dispatch({ type: 'NEXT', index: index });
                        const isRow = (evt.target as HTMLElement)?.localName === 'tr';
                        if (!isRow) dispatch({ type: 'NEXT', index: index });
                    }}
                    onKeyDownCapture={onKeyDownCapture}
                    ref={cursor}
                    aria-selected={index === state.index}
                    data-index={index}
                    className={classNames}
                    key={item}
                    onClick={handleOnClick?.(item)}
                >
                    {props.columns.map(({ key }) => {
                        if (props.customCells?.[key])
                            return (
                                <DataGridCell aria-labelledby={String(key)} key={key}>
                                    {props.customCells[key]({
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
                </tr>
            ))}
        </tbody>
    );
}

DataGrid.Footer = DataGridFooter;

function DataGridFooter({ children }: { children: ComponentChild }) {
    return <div className="adyen-fp-data-grid__footer">{children}</div>;
}

DataGrid.defaultProps = {
    condensed: false,
    outline: true,
    scrollable: true,
};

export default DataGrid;
