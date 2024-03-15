import useCoreContext from '@src/core/Context/useCoreContext';
import classNames from 'classnames';
import Typography from '@src/components/internal/Typography/Typography';
import { TypographyVariant } from '@src/components/internal/Typography/types';
import './SummaryItem.scss';
import AmountSkeleton from '@src/components/external/Transactions/components/AmountSkeleton/AmountSkeleton';
import { useEffect } from 'preact/hooks';
import { SummaryItemProps } from '@src/components/external/Transactions/components/SummaryItem/types';
import { BASE_CLASS, BODY_CLASS, LABEL_CLASS, PLACEHOLDER_CLASS } from '@src/components/external/Transactions/components/SummaryItem/constants';

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
                        <Typography variant={TypographyVariant.CAPTION} className={LABEL_CLASS}>
                            {i18n.get(config.labelKey)}
                        </Typography>
                    )}
                    {isSkeletonVisible ? (
                        <AmountSkeleton isLoading={isLoading} hasMargin={config.hasSkeletonMargin} width={config.skeletonWidth + 'px'} />
                    ) : isEmpty ? (
                        <span className={classNames([BASE_CLASS, PLACEHOLDER_CLASS])}></span>
                    ) : (
                        <div ref={config.ref} style={getColumnStyle(index)}>
                            <Typography
                                variant={config.valueHasLabelStyle ? TypographyVariant.CAPTION : TypographyVariant.TITLE}
                                className={classNames({ [LABEL_CLASS]: config.valueHasLabelStyle })}
                            >
                                {config.getValue()}
                            </Typography>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};
