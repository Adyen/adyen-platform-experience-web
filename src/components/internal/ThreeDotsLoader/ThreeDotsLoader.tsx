import cx from 'classnames';
import './ThreeDotsLoader.scss';

interface ThreeDotsLoaderProps {
    /**
     * Whether the loader should be rendered inline
     */
    inline?: boolean;

    /**
     * Size of the loader (small/medium/large)
     */
    size?: 'small' | 'medium' | 'large';

    /**
     * ARIA label for accessibility
     */
    ariaLabel?: string;

    /**
     * External classnames
     */
    className?: string;
}

const BASE_CLASS = 'adyen-pe-three-dots-loader';

const classes = {
    dot: BASE_CLASS + '__dot',
    loader: BASE_CLASS + '__loader',
    wrapper: BASE_CLASS + '__wrapper',
    wrapperInline: BASE_CLASS + '__wrapper--inline',
};

/**
 * Three-ball animation loader
 * Displays three bouncing dots for loading states
 * @param props -
 */
const ThreeDotsLoader = ({ inline = false, size = 'medium', ariaLabel = 'Loading', className }: ThreeDotsLoaderProps) => (
    <div
        className={cx(className, classes.wrapper, { [classes.wrapperInline]: inline })}
        aria-label={ariaLabel}
        data-testid="three-dots-loader"
        role="status"
    >
        <div className={cx(classes.loader, `${classes.loader}--${size}`)} data-testid="three-dots-container">
            <span className={classes.dot} data-testid="three-dots-dot" />
            <span className={classes.dot} data-testid="three-dots-dot" />
            <span className={classes.dot} data-testid="three-dots-dot" />
        </div>
    </div>
);

export default ThreeDotsLoader;
