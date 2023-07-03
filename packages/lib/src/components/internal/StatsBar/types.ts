import { ComponentChild } from 'preact';

export interface StatsBarProps {
    classNameModifiers?: string[];
    items: { label: string; value: ComponentChild; classNameModifiers?: string[] }[];
}
