import Localization from '../../../../../../core/Localization';
import { TranslationKey } from '../../../../../../translations';
import { RefObject } from 'preact';
import { HTMLAttributes } from 'preact/compat';

export type SummaryItemColumnConfig = {
    elemId?: string;
    labelKey?: TranslationKey;
    ref: RefObject<HTMLDivElement>;
    tooltipRef?: RefObject<HTMLSpanElement>;
    skeletonWidth: number;
    hasSkeletonMargin?: boolean;
    valueHasLabelStyle?: boolean;
    tooltipLabel?: TranslationKey;
    getValue: () => string | undefined;
    ariaLabel?: string;
};

export type SummaryItemProps = {
    columnConfigs: SummaryItemColumnConfig[];
    isEmpty?: boolean;
    isHeader?: boolean;
    isSkeletonVisible?: boolean;
    isLoading?: boolean;
    widths?: number[];
    onWidthsSet: (widths: number[]) => void;
    showLabelUnderline?: boolean;
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
