import { ref, type Ref } from 'vue';

export function sortMultiSelection<T extends string>(values: readonly T[] = []): T[] {
    return [...values].sort((first, second) => first.localeCompare(second));
}

export function useSortedMultiSelection<T extends string>(initialValue: readonly T[] = []) {
    const selectedValues = ref<T[]>(sortMultiSelection(initialValue)) as Ref<T[]>;

    const setSelectedValues = (values: readonly T[] = []) => {
        selectedValues.value = sortMultiSelection(values);
    };

    return { selectedValues, setSelectedValues } as const;
}

export default useSortedMultiSelection;
