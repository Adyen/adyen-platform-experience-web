import { ComponentChild } from 'preact';

export interface StatsBarProps {
    items: { label: string; value: ComponentChild }[];
}
