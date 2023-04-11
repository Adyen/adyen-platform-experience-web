export interface ButtonGroupProps {
    options: { label: string; selected: boolean; value: string; disabled: boolean }[];
    name: string;
    onChange(): void;
}
