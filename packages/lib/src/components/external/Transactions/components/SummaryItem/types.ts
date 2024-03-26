import Localization from '@src/core/Localization';
import { TranslationKey } from '@src/core/Localization/types';
import { RefObject } from 'preact';
import { HTMLAttributes } from 'preact/compat';

export type SummaryItemColumnConfig = {
    labelKey?: TranslationKey;
    ref: RefObject<HTMLDivElement>;
    tooltipRef?: RefObject<HTMLSpanElement>;
    skeletonWidth: number;
    hasSkeletonMargin?: boolean;
    valueHasLabelStyle?: boolean;
    tooltipLabel?: TranslationKey;
    getValue: () => string | undefined;
};

export type SummaryItemProps = {
    columnConfigs: SummaryItemColumnConfig[];
    isHeader?: boolean;
    isHovered?: boolean;
    isSkeletonVisible?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    isEmpty?: boolean;
};

export type SummaryItemLabelProps = {
    config: SummaryItemColumnConfig;
    i18n: Localization['i18n'];
    isSkeletonVisible: boolean;
    className?: string;
    onfocusoutCapture?: () => void;
    onMouseLeave?: () => void;
    onKeyDown?: () => void;
    onFocus?: () => void;
    onMouseEnter?: () => void;
} & Pick<HTMLAttributes<any>, 'aria-describedby'>;
