import cx from 'classnames';
import useCoreContext from '@src/core/Context/useCoreContext';
import './Status.scss';
import { StatusProps, StatusType } from './types';

export default function Status(props: StatusProps) {
    const { i18n } = useCoreContext();
    const getLabel = (key: StatusType) => {
        const labels = {
            booked: 'status.booked',
            active: 'status.active',
            inactive: 'status.inactive',
            pending: 'status.pending',
            closed: 'status.closed',
        } as const;

        return labels[key] ? i18n.get(labels[key]) : key;
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
        <div className={cx('adyen-pe-status', `adyen-pe-status--${getType(props.label)}`, `adyen-pe-status--${props.size}`)}>
            {getLabel(props.label)}
        </div>
    );
}

Status.defaultProps = {
    type: 'default',
    size: 'medium',
};
