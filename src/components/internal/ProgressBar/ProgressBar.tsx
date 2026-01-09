import { useMemo } from 'preact/hooks';
import cx from 'classnames';
import './ProgressBar.scss';
import Typography from '../Typography/Typography';
import { TypographyElement, TypographyVariant } from '../Typography/types';
import { clamp } from '../../../utils';
import { Tooltip } from '../Tooltip/Tooltip';

interface ProgressBarProps {
    /**
     * Maximum value for the progress bar.
     *
     * @default 1
     */
    max?: number;

    /**
     * Current value of the progress bar.
     */
    value: number;

    /**
     * Labels for the progress bar
     */
    labels?: {
        /**
         * The label that describes the current value of the progress bar.
         */
        current?: string;

        /**
         * The label that describes the maximum value of the progress bar.
         */
        max?: string;

        /**
         * Accessible label for the progress bar (optional).
         */
        ariaLabel?: string;
    };

    /**
     * Tooltips for the progress bar segments.
     */
    tooltips?: {
        /**
         * Tooltip content to describe the filled portion of the progress bar (progress).
         */
        progress?: string;

        /**
         * Tooltip content to describe the remaining portion of the progress bar.
         */
        remaining?: string;
    };

    /**
     * Optional custom class name to apply additional styles to the progress bar component.
     */
    className?: string;
}

/**
 * Accessible custom ProgressBar component
 * @param props - ProgressBarProps
 */
const ProgressBar = ({ max = 1, value, labels, tooltips, className }: ProgressBarProps) => {
    const percentage = useMemo(() => clamp(0, (value * 100) / max, 100), [value, max]);
    const shouldDisplayLegend = !!(labels?.current || labels?.max);
    const ariaLabel = labels?.ariaLabel ?? (labels?.current ? `${labels.current}: ${value}` : `${value}/${max}`);

    return (
        <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuetext={`${percentage}%`}
            aria-label={ariaLabel}
            className={cx('adyen-pe-progress-bar', className)}
        >
            <div className="adyen-pe-progress-bar__track" role="presentation">
                <div className="adyen-pe-progress-bar__track-background"></div>
                <ProgressBarSegment
                    tooltipContent={tooltips?.progress}
                    title={labels?.current}
                    percentage={percentage}
                    className="adyen-pe-progress-bar__track-fill"
                />
                <ProgressBarSegment
                    tooltipContent={tooltips?.remaining}
                    title={labels?.max}
                    percentage={100 - percentage}
                    className="adyen-pe-progress-bar__track-remaining"
                />
            </div>

            {shouldDisplayLegend && (
                <div className="adyen-pe-progress-bar__legend" aria-hidden="true">
                    {labels.current && (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className="adyen-pe-progress-bar__legend-label">
                            {labels.current}
                        </Typography>
                    )}
                    {labels.max && (
                        <Typography el={TypographyElement.SPAN} variant={TypographyVariant.CAPTION} className="adyen-pe-progress-bar__legend-label">
                            {labels.max}
                        </Typography>
                    )}
                </div>
            )}
        </div>
    );
};
interface ProgressBarSegmentProps {
    tooltipContent?: string;
    title?: string;
    percentage: number;
    className: string;
}
const ProgressBarSegment = ({ tooltipContent, title, percentage, className }: ProgressBarSegmentProps) => {
    const getContent = (title?: string) => <div className={className} aria-label={title} style={{ width: `${percentage}%` }} />;
    return tooltipContent ? <Tooltip content={tooltipContent}>{getContent(title)}</Tooltip> : getContent(title);
};

export default ProgressBar;
