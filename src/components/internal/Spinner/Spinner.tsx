import './Spinner.scss';

interface SpinnerProps {
    /**
     * Whether the spinner should be rendered inline
     */
    inline?: boolean;

    /**
     * size of the spinner (small/medium/large)
     */
    size?: string;
}

/**
 * Default Loading Spinner
 * @param props -
 */
const Spinner = ({ inline = false, size = 'large' }: SpinnerProps) => (
    <div className={`adyen-pe-spinner__wrapper ${inline ? 'adyen-pe-spinner__wrapper--inline' : ''}`}>
        <div className={`adyen-pe-spinner adyen-pe-spinner--${size}`} />
    </div>
);

export default Spinner;
