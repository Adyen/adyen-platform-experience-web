import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../language/types';

export type TabProps = { label: TranslationKey; content: ComponentChild; disabled?: boolean };
export type TabComponentProps<T extends TabProps[]> = { tabs: T; defaultActiveTab?: string };
