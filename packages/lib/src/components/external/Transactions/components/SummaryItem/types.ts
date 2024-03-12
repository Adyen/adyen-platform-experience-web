import { TranslationKey } from '@src/core/Localization/types';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import { RefObject } from 'preact';

export type SummaryItemColumnConfig = {
    labelKey?: TranslationKey;
    ref: RefObject<HTMLDivElement>;
    skeletonWidth: number;
    hasSkeletonMargin?: boolean;
    valueTypographyVariant: TypographyVariant;
    getValue: () => string | undefined;
};

export type SummaryItemProps = {
    columnConfigs: SummaryItemColumnConfig[];
    isHeader?: boolean;
    isSkeletonVisible?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
};
