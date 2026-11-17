import { toValue, watch, type MaybeRefOrGetter } from 'vue';
import type { PaymentLinkFieldName } from '../../../../domain/src';
import { useWizard } from './wizardContext';

interface UseAllowedOptionsParams {
    name: MaybeRefOrGetter<PaymentLinkFieldName>;
    items: MaybeRefOrGetter<ReadonlyArray<{ id: string }>>;
    loading?: MaybeRefOrGetter<boolean | undefined>;
    preselect?: (id: string) => void;
}

export function useAllowedOptions({ name, items, loading, preselect }: UseAllowedOptionsParams) {
    const wizard = useWizard();

    watch(
        [() => toValue(items), () => toValue(loading), () => wizard.getFieldConfig(toValue(name)).visible],
        ([items, loading, visible]) => {
            const fieldName = toValue(name);
            const value = wizard.getValue(fieldName);
            if (loading || !items.length || items.some(({ id }) => id === value)) return;
            if (preselect && visible && items.length === 1 && items[0]) preselect(items[0].id);
            else if (value) wizard.setValue(fieldName, '');
        },
        { immediate: true }
    );
}
