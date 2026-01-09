import AmountSkeleton from '../AmountSkeleton/AmountSkeleton';
import { AMOUNT_CLASS, BASE_CLASS, BODY_CLASS, LABEL_CLASS, PLACEHOLDER_CLASS } from './constants';
import { SummaryItemLabel } from './SummaryItemLabel';
import { SummaryItemColumnConfig, SummaryItemProps } from './types';
import { Tooltip } from '../../../../internal/Tooltip/Tooltip';
import { TypographyElement, TypographyVariant } from '../../../../internal/Typography/types';
import Typography from '../../../../internal/Typography/Typography';
import useCoreContext from '../../../../../core/Context/useCoreContext';
import classNames from 'classnames';
import { useCallback, useEffect } from 'preact/hooks';
import './SummaryItem.scss';
import { containerQueries, useResponsiveContainer } from '../../../../../hooks/useResponsiveContainer';

export const SummaryItem = ({
    columnConfigs,
    isHeader = false,
    showLabelUnderline = false,
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

    const isXsContainer = useResponsiveContainer(containerQueries.only.xs);

    const typographyVariant = useCallback(
        (config: SummaryItemColumnConfig, isLongValue: boolean) => {
            if (config.valueHasLabelStyle) {
                return TypographyVariant.CAPTION;
            }
            return isLongValue && !isXsContainer ? TypographyVariant.BODY : TypographyVariant.TITLE;
        },
        [isXsContainer]
    );

    return (
        <div className={classNames(BASE_CLASS, { [BODY_CLASS]: !isHeader })}>
            {columnConfigs.map((config, index) => {
                const value = config.getValue();
                const isLongValue = !!value && value.length > 15;
                return (
                    <div key={index}>
                        {isHeader && (
                            <div role="presentation">
                                {config.tooltipLabel ? (
                                    <Tooltip content={i18n.get(`${config.tooltipLabel}`)} isUnderlineVisible={showLabelUnderline}>
                                        <SummaryItemLabel config={config} i18n={i18n} isSkeletonVisible={isSkeletonVisible} />
                                    </Tooltip>
                                ) : (
                                    <SummaryItemLabel config={config} i18n={i18n} isSkeletonVisible={isSkeletonVisible} />
                                )}
                            </div>
                        )}
                        {isSkeletonVisible ? (
                            <AmountSkeleton isLoading={isLoading} hasMargin={config.hasSkeletonMargin} width={config.skeletonWidth + 'px'} />
                        ) : isEmpty ? (
                            <span className={classNames([BASE_CLASS, PLACEHOLDER_CLASS])}></span>
                        ) : (
                            <div id={config.elemId} ref={config.ref} style={getColumnStyle(index)} aria-label={config.ariaLabel} role="presentation">
                                <Typography
                                    el={TypographyElement.SPAN}
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
