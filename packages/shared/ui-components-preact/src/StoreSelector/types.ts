export interface StoreSelectorItemParams {
    storeCode: string;
    description: string;
    id: string;
    name: string;
}

export interface StoreSelectorProps {
    stores?: StoreSelectorItemParams[];
    selectedStoreId?: string;
    setSelectedStoreId: (id: string) => void;
}
