import { ComponentChild } from 'preact';
import { TranslationKey } from '../../../translations';

export type TabProps<TabId extends string> = {
    content: ComponentChild;
    disabled?: boolean;
    id: TabId;
    label: TranslationKey;
};

export type TabComponentProps<TabId extends string> = {
    onChange?: <ActiveTab extends TabProps<TabId>>(activeTab: ActiveTab) => void;
    defaultActiveTab?: TabId;
    tabs: readonly TabProps<TabId>[];
};
