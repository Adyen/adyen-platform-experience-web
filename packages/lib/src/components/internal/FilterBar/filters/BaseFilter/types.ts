import { JSX } from 'preact';

export interface BaseFilterProps {
    onChange: (args: { [k: string]: string }) => void;
    name: string;
    value?: string;
    type?: string;
    label: string;
    classNameModifiers?: string[];
    body?: (args: BaseFilterProps & { updateFilterValue: (e: Event) => void }) => JSX.Element;
}
