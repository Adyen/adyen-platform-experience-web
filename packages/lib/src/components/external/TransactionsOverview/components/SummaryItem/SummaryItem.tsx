import AmountSkeleton from '@src/components/external/TransactionsOverview/components/AmountSkeleton/AmountSkeleton';
import {
    AMOUNT_CLASS,
    BASE_CLASS,
    BODY_CLASS,
    LABEL_CLASS,
    PLACEHOLDER_CLASS,
} from '@src/components/external/TransactionsOverview/components/SummaryItem/constants';
import { SummaryItemLabel } from '@src/components/external/TransactionsOverview/components/SummaryItem/SummaryItemLabel';
import { SummaryItemColumnConfig, SummaryItemProps } from '@src/components/external/TransactionsOverview/components/SummaryItem/types';
import { Tooltip } from '@src/components/internal/Tooltip/Tooltip';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import Typography from '@src/components/internal/Typography/Typography';
import useCoreContext from '@src/core/Context/useCoreContext';
import classNames from 'classnames';
import { useCallback, useEffect } from 'preact/hooks';
import './SummaryItem.scss';
import { mediaQueries, useMediaQuery } from '@src/components/external/TransactionsOverview/hooks/useMediaQuery';

export const SummaryItem = ({
    columnConfigs,
    isHeader = false,
    isHovered = false,
    isSkeletonVisible = false,
    isLoading = false,
    widths,
    onWidthsSet,
    isEmpty,
}: SummaryItemProps) => {
    const { i18n } = useCoreContext();

    useEffect(() => {
        const newWidths = columnConfigs.map(config => config.ref?.current?.getBoundingClientRect().width ?? 0);
        onWidthsSet(newWidths);
        // We need columnConfigs only for the refs, therefore we don't need to include them in effect dependencies
        // If we do include it though, we run into an infinite loop of re-rendering
        // TODO: Check what causes the infinite loop
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onWidthsSet]);

    const getColumnStyle = (index: number) => ({ width: widths && widths[index] ? widths[index] : 'auto' });

    const isXsScreen = useMediaQuery(mediaQueries.only.xs);

    const typographyVariant = useCallback(
        (config: SummaryItemColumnConfig, isLongValue: boolean) => {
            if (config.valueHasLabelStyle) {
                return TypographyVariant.CAPTION;
            }
            return isLongValue && !isXsScreen ? TypographyVariant.BODY : TypographyVariant.TITLE;
        },
        [isXsScreen]
    );

    return (
        <div className={classNames(BASE_CLASS, { [BODY_CLASS]: !isHeader })}>
            {columnConfigs.map((config, index) => {
                const value = config.getValue();
                const isLongValue = !!value && value.length > 12;
                return (
                    <div key={index}>
                        {isHeader &&
                            (config.tooltipLabel ? (
                                <Tooltip content={i18n.get(`${config.tooltipLabel}`)} isContainerHovered={isHovered}>
                                    <SummaryItemLabel config={config} i18n={i18n} isSkeletonVisible={isSkeletonVisible} />
                                </Tooltip>
                            ) : (
                                <SummaryItemLabel config={config} i18n={i18n} isSkeletonVisible={isSkeletonVisible} />
                            ))}
                        {isSkeletonVisible ? (
                            <AmountSkeleton isLoading={isLoading} hasMargin={config.hasSkeletonMargin} width={config.skeletonWidth + 'px'} />
                        ) : isEmpty ? (
                            <span className={classNames([BASE_CLASS, PLACEHOLDER_CLASS])}></span>
                        ) : (
                            <div ref={config.ref} style={getColumnStyle(index)}>
                                <Typography
                                    variant={typographyVariant(config, isLongValue)}
                                    className={classNames({ [LABEL_CLASS]: config.valueHasLabelStyle, [AMOUNT_CLASS]: !config.valueHasLabelStyle })}
                                >
                                    {value}
                                </Typography>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
