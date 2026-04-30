import { useMemo } from 'preact/hooks';
import useCoreContext from '../../../../../src/core/Context/useCoreContext';
import { uuid } from '../../../../../src/utils';
import { StructuredListItem } from './types';

export const useStructuredListItems = (items: StructuredListItem[]) => {
    const { i18n } = useCoreContext();
    return useMemo(() => {
        return items.map(item => {
            return {
                key: item.key,
                value: item.value,
                id: item.id,
                uid: item.id || uuid(),
                label: item.label ?? i18n.get(item.key),
                type: item.type,
                config: item.config,
                rawValue: item.rawValue,
                render: item.render,
            };
        });
    }, [i18n, items]);
};
