import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../translations';

export type TabProps = { label: TranslationKey; id: string; content: ComponentChild; disabled?: boolean };
export type TabComponentProps<T extends TabProps[]> = { tabs: T; defaultActiveTab?: T[number] extends { id: infer U } ? U : never };
