import cx from 'classnames';
import './LoadingSkeleton.scss';

const LoadingSkeleton = ({ rowNumber, className }: { rowNumber: number; className?: string }) => {
    return (
        <div className={cx('adyen-pe-pay-by-link-settings__skeleton', className)}>
            {[...Array(rowNumber)].map((_, index) => (
                <div key={index} className="adyen-pe-pay-by-link-settings__skeleton-item"></div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
