import { identity, isFunction } from '../../../../../../../utils';
import { SelectItem } from '../../../../../../internal/FormFields/Select/types';
import { SelectionOptionsList } from './types';

export const selectionOptionsFor = <T extends string = string>(list: SelectionOptionsList<T>, mapOptionName?: (id: T) => string | undefined) => {
    const mapOption = isFunction(mapOptionName) ? mapOptionName : identity<T>;
    return Object.freeze(list.map(id => ({ id, name: mapOption(id) ?? id }) as SelectItem<T>));
};
