export function getStoreDropdownDisplayValue(label: string, description?: string): string {
    return description?.trim() ? description : label;
}
