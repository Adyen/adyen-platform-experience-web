import cx from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import './Status.scss';
import { StatusProps } from './types';

export default function Status(props: StatusProps) {
    const { i18n } = useCoreContext();
    const getLabel = (key: string) => {
        const labels: Record<string, string> = {
            booked: 'status.booked',
            active: 'status.active',
            inactive: 'status.inactive',
        };

        return labels[key] || key;
    };

    const getType = (type: string) => {
        switch (type) {
            case 'booked':
            case 'active':
                return 'success';
            case 'inactive':
                return 'warning';
            case 'failed':
                return 'error';
            default:
                return 'unknown';
        }
    };

    return (
        <div className={cx('adyen-fp-status', `adyen-fp-status--${getType(props.label)}`, `adyen-fp-status--${props.size}`)}>
            {i18n.get(getLabel(props.label))}
        </div>
    );
}

Status.defaultProps = {
    type: 'default',
    size: 'medium',
};
