import { SelectItem } from '../../../../../internal/FormFields/Select/types';
import { SelectionOptionsList } from './types';

export const selectionOptionsFor = <T extends string = string>(list: SelectionOptionsList<T>) =>
    Object.freeze(list.map(id => ({ id, name: id } as SelectItem)));
