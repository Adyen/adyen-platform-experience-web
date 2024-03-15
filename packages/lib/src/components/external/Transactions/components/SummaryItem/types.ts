import { TranslationKey } from '@src/core/Localization/types';
import { RefObject } from 'preact';

export type SummaryItemColumnConfig = {
    labelKey?: TranslationKey;
    ref: RefObject<HTMLDivElement>;
    titleRef?: RefObject<HTMLSpanElement>;
    skeletonWidth: number;
    hasSkeletonMargin?: boolean;
    valueHasLabelStyle?: boolean;
    getValue: () => string | undefined;
};

export type SummaryItemProps = {
    columnConfigs: SummaryItemColumnConfig[];
    isHeader?: boolean;
    isSkeletonVisible?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    isEmpty?: boolean;
};
