export interface CheckboxProps {
    checked?: boolean;
    classNameModifiers?: string[];
    description?: string;
    disabled?: boolean;
    id?: string;
    label?: string;
    name?: string;
    onInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    value?: boolean;
}
