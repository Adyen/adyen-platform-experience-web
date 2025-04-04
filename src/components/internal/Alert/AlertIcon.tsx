import Icon from '../Icon';
import { AlertTypeOption } from './types';

export interface AlertIconProps {
    type: AlertTypeOption;
    className?: string;
}

export const AlertIcon = ({ className, type }: AlertIconProps) => {
    switch (type) {
        case AlertTypeOption.WARNING:
            return <Icon name="warning-filled" className={className} />;
        case AlertTypeOption.CRITICAL:
            return <Icon name="cross-circle-fill" className={className} />;
        case AlertTypeOption.HIGHLIGHT:
            return <Icon name="info-filled" className={className} />;
        case AlertTypeOption.SUCCESS:
        default:
            return <Icon name="checkmark-circle-fill" className={className} />;
    }
};
