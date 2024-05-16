import { EMPTY_ARRAY } from '../../../../../../utils/common';
import { SelectItem } from '../../../../../internal/FormFields/Select/types';
import { SelectionOptionsList } from './types';

export const listFrom = <T extends string = string>(value?: string | any[]) => {
    const stringedValue = `${value || ''}`.trim();
    return (stringedValue ? stringedValue.split(/(?:\s*,\s*)+/).filter(Boolean) : EMPTY_ARRAY) as T[];
};

export const selectionOptionsFor = <T extends string = string>(list: SelectionOptionsList<T>) =>
    Object.freeze(list.map(id => ({ id, name: id } as SelectItem)));
