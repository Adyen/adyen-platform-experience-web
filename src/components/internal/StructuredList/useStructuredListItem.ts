import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../core/Context/useCoreContext';
import { uuid } from '../../../utils';
import { StructuredListItem } from './types';

export const useStructuredListItems = (items: StructuredListItem[]) => {
    const { i18n } = useCoreContext();
    return useMemo(() => {
        return items.map(item => {
            return {
                key: item.key,
                value: item.value,
                id: uuid(),
                label: item.label ?? i18n.get(item.key),
                type: item.type,
                config: item.config,
                rawValue: item.rawValue,
            };
        });
    }, [i18n, items]);
};
