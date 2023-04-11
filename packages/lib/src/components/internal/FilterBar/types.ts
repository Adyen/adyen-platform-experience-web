export interface FilterBarProps {
    filters: Record<string, any> | null;
    resetFilters: () => void;
}
