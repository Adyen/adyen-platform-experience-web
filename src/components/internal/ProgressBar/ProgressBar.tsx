import { useMemo } from 'preact/hooks';
import cx from 'classnames';
import './ProgressBar.scss';

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
     * Optional custom class name to apply additional styles to the progress bar component.
     */
    className?: string;
}

/**
 * Accessible custom ProgressBar component
 * @param props - ProgressBarProps
 */
const ProgressBar = ({ max = 1, value, labels, className }: ProgressBarProps) => {
    const percentage = useMemo(() => Math.min((value / max) * 100, 100), [value, max]);
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
            className={cx('adyen-fp-progress-bar', className)}
        >
            <div className="adyen-fp-progress-bar__track" title={labels?.max}>
                <div className="adyen-fp-progress-bar__fill" style={{ width: `${percentage}%` }} title={labels?.current} />
            </div>

            {shouldDisplayLegend && (
                <div className="adyen-fp-progress-bar__legend" aria-hidden="true">
                    {labels.current && <span className="adyen-fp-progress-bar__legend-label">{labels.current}</span>}
                    {labels.max && <span className="adyen-fp-progress-bar__legend-label">{labels.max}</span>}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
