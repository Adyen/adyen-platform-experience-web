import './StatsBar.scss';
import { StatsBarProps } from './types';

export default function StatsBar(props: StatsBarProps) {
    return (
        <ul className="adyen-fp-stats-bar">
            {props.items.map(item => (
                <li className="adyen-fp-stats-bar__item" key={item.label} aria-label={item.label}>
                    <div className="adyen-fp-stats-bar__label">{item.label}</div>
                    <div className="adyen-fp-stats-bar__value">{item.value}</div>
                </li>
            ))}
        </ul>
    );
}
