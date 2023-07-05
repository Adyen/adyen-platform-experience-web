import './StatsBar.scss';
import { StatsBarProps } from './types';
import classNames from 'classnames';

export default function StatsBar(props: StatsBarProps) {
    return (
        <ul className={classNames('adyen-fp-stats-bar adyen-fp-responsive-container')}>
            <div
                className={classNames(
                    'adyen-fp-stats-bar__content adyen-fp-grid md-adyen-fp-cols-auto adyen-fp-space-cols-between',
                    props.classNameModifiers
                )}
            >
                {props.items.map(item => (
                    <li className={classNames('adyen-fp-col-span-auto', item.classNameModifiers)} key={item.label} aria-label={item.label}>
                        <div className="adyen-fp-stats-bar__content-label">{item.label}</div>
                        <div className="adyen-fp-stats-bar__content-value">{item.value}</div>
                    </li>
                ))}
            </div>
        </ul>
    );
}
