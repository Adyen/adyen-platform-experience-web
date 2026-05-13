// Copied from @integration-components/ui-components-preact — temporary until this Preact layer is removed in the Vue migration.
import './Spinner.scss';

interface SpinnerProps {
    inline?: boolean;
    size?: 'x-small' | 'small' | 'medium' | 'large';
}

const Spinner = ({ inline = false, size = 'large' }: SpinnerProps) => (
    <div className={`adyen-pe-spinner__wrapper ${inline ? 'adyen-pe-spinner__wrapper--inline' : ''}`}>
        <div className={`adyen-pe-spinner adyen-pe-spinner--${size}`} />
    </div>
);

export default Spinner;
