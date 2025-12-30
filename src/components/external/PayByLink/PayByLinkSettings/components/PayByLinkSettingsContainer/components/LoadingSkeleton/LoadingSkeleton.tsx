import cx from 'classnames';
import './LoadingSkeleton.scss';

const LoadingSkeleton = ({ rowNumber, className }: { rowNumber: number; className?: string }) => {
    return (
        <div className={cx('adyen-pe-pay-by-link-settings__skeleton', className)}>
            <div className="adyen-pe-pay-by-link-settings__skeleton-item adyen-pe-pay-by-link-settings__skeleton-item--header"></div>
            {[...Array(rowNumber)].map((_, index) => (
                <div className={'adyen-pe-pay-by-link-settings__skeleton-container'} key={index}>
                    <div className="adyen-pe-pay-by-link-settings__skeleton-item adyen-pe-pay-by-link-settings__skeleton-item--small"></div>
                    <div className="adyen-pe-pay-by-link-settings__skeleton-item adyen-pe-pay-by-link-settings__skeleton-item--large"></div>
                </div>
            ))}
        </div>
    );
};

export default LoadingSkeleton;
