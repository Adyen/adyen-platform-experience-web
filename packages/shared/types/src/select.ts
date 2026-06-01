export type SelectChangeEvent<T = string> = {
    target: {
        value: T;
        name?: string;
    };
};

export interface SelectItem<T extends string = string> {
    disabled?: boolean;
    icon?: string;
    id: T;
    name: string;
    selectedOptionName?: string;
}
