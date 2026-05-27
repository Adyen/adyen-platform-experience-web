import { ComponentChild } from 'preact';
import { TranslationKey } from '@integration-components/core';

export type TabProps<TabId extends string> = {
    content: ComponentChild;
    disabled?: boolean;
    id: TabId;
    label: TranslationKey;
};

export type TabComponentProps<TabId extends string> = {
    onChange?: <ActiveTab extends TabProps<TabId>>(activeTab: ActiveTab) => void;
    tabs: readonly TabProps<TabId>[];
    activeTab?: TabId;
};
