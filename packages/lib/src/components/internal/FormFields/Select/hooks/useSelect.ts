import { useCallback, useEffect, useState } from 'preact/hooks';
import { EMPTY_ARRAY } from '@src/utils/common';
import { SelectItem, SelectProps } from '../types';

const useSelect = <T extends SelectItem>({ items, multiSelect, selected }: Pick<SelectProps<T>, 'items' | 'multiSelect' | 'selected'>) => {
    const getSelectedItems = useCallback(() => {
        const _selected = (EMPTY_ARRAY as readonly T['id'][]).concat(selected ?? EMPTY_ARRAY).filter(Boolean);
        const _selectedItems = items.filter(item => _selected.includes(item.id));
        return Object.freeze(multiSelect ? _selectedItems : _selectedItems.slice(0, 1));
    }, [items, selected]);

    const [selection, setSelection] = useState(getSelectedItems);
    const clearSelection = useCallback(() => setSelection(EMPTY_ARRAY), [setSelection]);

    const select = useCallback(
        (item: T) => {
            setSelection(selection => {
                if (!multiSelect) return Object.freeze([item]);

                const nextSelection = [...selection];
                const index = nextSelection.indexOf(item);

                index < 0 ? nextSelection.push(item) : nextSelection.splice(index, 1);
                return Object.freeze(nextSelection);
            });
        },
        [multiSelect, setSelection]
    );

    useEffect(() => setSelection(getSelectedItems), [getSelectedItems, setSelection]);

    return { clearSelection, select, selection } as const;
};

export default useSelect;
