import './StatsBar.scss';
import { StatsBarProps } from './types';
import classNames from 'classnames';

export default function StatsBar(props: StatsBarProps) {
    return (
        <ul
            className={classNames(
                'adyen-fp-stats-bar adyen-fp-grid md:adyen-fp-auto-cols-auto adyen-fp-space-cols-between',
                props.classNameModifiers
            )}
        >
            {props.items.map(item => (
                <li
                    className={classNames('adyen-fp-stats-bar__item adyen-fp-col-span-auto', item.classNameModifiers)}
                    key={item.label}
                    aria-label={item.label}
                >
                    <div className="adyen-fp-stats-bar__label">{item.label}</div>
                    <div className="adyen-fp-stats-bar__value">{item.value}</div>
                </li>
            ))}
        </ul>
    );
}
