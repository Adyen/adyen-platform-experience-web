import { useCallback, useEffect, useState } from 'preact/hooks';
import { EMPTY_ARRAY } from '../../../../../utils';
import { SelectItem, SelectProps } from '../types';

const useSelect = <T extends SelectItem>({ items, multiSelect, selected }: Pick<SelectProps<T>, 'items' | 'multiSelect' | 'selected'>) => {
    const getSelectedItems = useCallback(
        (selectedItems: typeof selected = EMPTY_ARRAY) => {
            const _selected = (EMPTY_ARRAY as readonly T['id'][]).concat(selectedItems ?? EMPTY_ARRAY).filter(Boolean);
            const _selectedItems = items.filter(item => _selected.includes(item.id));
            const selection = multiSelect ? _selectedItems : _selectedItems.slice(0, 1);
            return selection.length ? Object.freeze(selection) : EMPTY_ARRAY;
        },
        [items, multiSelect]
    );

    const [selection, setSelection] = useState(getSelectedItems(selected));

    const resetSelection = useCallback(
        (selection: readonly T[] | T[] = EMPTY_ARRAY) => {
            const nextSelection = selection.filter(item => items.includes(item));
            setSelection(nextSelection.length ? Object.freeze(nextSelection) : EMPTY_ARRAY);
        },
        [items, setSelection]
    );

    const select = useCallback(
        (item: T) => {
            setSelection(currentSelection => {
                const index = currentSelection.indexOf(item);

                // Item not already selected
                if (index < 0) return Object.freeze(((multiSelect ? currentSelection : EMPTY_ARRAY) as readonly T[]).concat(item));

                // Item is current selection
                if (!multiSelect) return currentSelection;

                // Item should be deselected
                const nextSelection = [...currentSelection];
                nextSelection.splice(index, 1);
                return nextSelection.length ? Object.freeze(nextSelection) : EMPTY_ARRAY;
            });
        },
        [multiSelect, setSelection]
    );

    useEffect(() => setSelection(getSelectedItems(selected)), [getSelectedItems, selected, setSelection]);

    return { resetSelection, select, selection } as const;
};

export default useSelect;
