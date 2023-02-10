import { h } from 'preact';
import cx from 'classnames';
import useCoreContext from '../../../core/Context/useCoreContext';
import './Status.scss';

export default function Status(props) {
    const { i18n } = useCoreContext();
    const getLabel = key => {
        const labels = {
            booked: 'status.booked',
            active: 'status.active',
            inactive: 'status.inactive',
        };

        return labels[key] || key;
    };

    const getType = type => {
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
