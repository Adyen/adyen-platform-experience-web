export interface DateFilterProps {
    from?: string;
    to?: string;
    value?: string | null;
    onChange: (args: { [k: string]: string }) => void;
    label: string;
    name: string;
    classNameModifiers?: string[];
}
