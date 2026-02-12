import MultiSelectionFilter from '../MultiSelectionFilter';
import useMultiSelectionFilterProps, { UseMultiSelectionFilterPropsConfig } from '../../../../../hooks/useMultiSelectionFilterProps';

export interface TransactionMultiSelectionFilterProps<T extends string> extends UseMultiSelectionFilterPropsConfig<T> {
    placeholder: string;
}

const TransactionMultiSelectionFilter = <T extends string>({
    placeholder,
    ...useMultiSelectionFilterPropsConfig
}: TransactionMultiSelectionFilterProps<T>) => {
    const { selection, ...filterProps } = useMultiSelectionFilterProps(useMultiSelectionFilterPropsConfig);
    return <MultiSelectionFilter {...filterProps} placeholder={placeholder} selection={selection as (typeof selection)[number][]} />;
};

export default TransactionMultiSelectionFilter;
