import Popover from '@src/components/internal/Popover/Popover';
import { PopoverContainerVariant } from '@src/components/internal/Popover/types';
import useCoreContext from '@src/core/Context/useCoreContext';
import { TranslationKey } from '@src/core/Localization/types';
import classNames from 'classnames';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import './SummaryItem.scss';
import AmountSkeleton from '@src/components/external/Transactions/components/AmountSkeleton/AmountSkeleton';
import { Ref } from 'preact';
import { MutableRef, useEffect, useState } from 'preact/hooks';
import { SummaryItemProps } from '@src/components/external/Transactions/components/SummaryItem/types';
import {
    AMOUNT_CLASS,
    BASE_CLASS,
    BODY_CLASS,
    LABEL_CLASS,
    PLACEHOLDER_CLASS,
} from '@src/components/external/Transactions/components/SummaryItem/constants';

export const SummaryItem = ({
    columnConfigs,
    isHeader = false,
    isSkeletonVisible = false,
    isLoading = false,
    widths,
    onWidthsSet,
    isEmpty,
}: SummaryItemProps) => {
    const { i18n } = useCoreContext();
    const [showTooltip, setShowTooltip] = useState<TranslationKey | null>(null);
    const [targetElement, setTargetElement] = useState<null | Ref<HTMLSpanElement>>(null);

    useEffect(() => {
        const newWidths = columnConfigs.map(config => config.ref?.current?.getBoundingClientRect().width ?? 0);
        onWidthsSet(newWidths);
        // We need columnConfigs only for the refs, therefore we don't need to include them in effect dependencies
        // If we do include it though, we run into an infinite loop of re-rendering
        // TODO: Check what causes the infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onWidthsSet]);

    const getColumnStyle = (index: number) => ({ width: widths && widths[index] ? widths[index] : 'auto' });

    return (
        <div className={classNames(BASE_CLASS, { [BODY_CLASS]: !isHeader })}>
            {columnConfigs.map((config, index) => (
                <div key={index}>
                    {isHeader && config.labelKey && (
                        <span
                            ref={config.titleRef}
                            onMouseOver={() => {
                                setShowTooltip(`tooltip.${config.labelKey}` as TranslationKey);
                                setTargetElement(config?.titleRef ?? null);
                            }}
                            onMouseOut={() => {
                                setShowTooltip(null);
                                setTargetElement(null);
                            }}
                        >
                            <Typography variant={TypographyVariant.CAPTION} className={LABEL_CLASS}>
                                {i18n.get(config.labelKey)}
                            </Typography>
                        </span>
                    )}
                    {isSkeletonVisible ? (
                        <AmountSkeleton isLoading={isLoading} hasMargin={config.hasSkeletonMargin} width={config.skeletonWidth + 'px'} />
                    ) : isEmpty ? (
                        <span className={classNames([BASE_CLASS, PLACEHOLDER_CLASS])}></span>
                    ) : (
                        <div ref={config.ref} style={getColumnStyle(index)}>
                            <Typography
                                variant={config.valueHasLabelStyle ? TypographyVariant.CAPTION : TypographyVariant.TITLE}
                                className={classNames(AMOUNT_CLASS, { [LABEL_CLASS]: config.valueHasLabelStyle })}
                            >
                                {config.getValue()}
                            </Typography>
                        </div>
                    )}
                </div>
            ))}
            {showTooltip && targetElement && (
                <Popover open={!!showTooltip} variant={PopoverContainerVariant.TOOLTIP} targetElement={targetElement as MutableRef<Element>}>
                    <Typography variant={TypographyVariant.CAPTION}>{i18n.get(showTooltip)}</Typography>
                </Popover>
            )}
        </div>
    );
};
