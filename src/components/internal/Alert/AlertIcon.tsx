import Icon from '../Icon';
import { AlertTypeOption } from './types';

export interface AlertIconProps {
    type: AlertTypeOption;
    className?: string;
}

export const AlertIcon = ({ className, type }: AlertIconProps) => {
    switch (type) {
        case 'warning':
            return <Icon name="warning-filled" className={className} />;
        case 'critical':
            return <Icon name="cross-circle-fill" className={className} />;
        case 'highlight':
            return <Icon name="info-filled" className={className} />;
        case 'success':
        default:
            return <Icon name="checkmark-circle-fill" className={className} />;
    }
};
