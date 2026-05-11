import cx from 'classnames';
import Icon from '../Icon';
import './SuccessIcon.scss';

export interface SuccessIconProps {
    className?: string;
}

export const SuccessIcon = ({ className }: SuccessIconProps) => {
    return (
        <div className={cx('adyen-pe-success-icon', className)}>
            <Icon name="checkmark" className="adyen-pe-success-icon__icon" />
        </div>
    );
};

export default SuccessIcon;
