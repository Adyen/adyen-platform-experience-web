import { ComponentChild, VNode } from 'preact';
import { TranslationKey } from '../../../language/types';
import { Tab } from './Tabs';
import { ComponentProps } from 'preact/compat';

export type TabProps<T extends TranslationKey> = { label: T; content: ComponentChild; disabled?: boolean };

export type TabComponent<T extends ComponentProps<typeof Tab>> = VNode<T>;
export type TabComponentProps = TabComponent<ComponentProps<typeof Tab>>;

export interface TabsComponentOneChild<T extends TabComponentProps> {
    children: T;
    defaultActiveTab?: TranslationKey;
}
export interface TabsComponentChildren<T extends TabComponentProps[]> {
    children: T;
    defaultActiveTab?: TranslationKey;
}
